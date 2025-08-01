var axios = require('axios');
var express = require('express');

const router = express.Router();

const CMS_URIS = {
  test: 'https://asc-wds-test.directus.app',
  other: 'https://asc-wds-test.directus.app',
  production: 'https://asc-wds-cms.directus.app',
};

const getContentFromCms = async (req, res) => {
  const { env, ...queryParams } = req.query;
  const path = req.params.path;

  if (!path || typeof path !== 'string') return res.status(400).json({ error: 'Missing or invalid path' });
  if (!env || typeof env !== 'string' || !CMS_URIS[env]) {
    return res.status(400).json({ error: 'Missing or invalid env' });
  }

  if (!/^[a-zA-Z0-9/_-]+$/.test(path)) {
    return res.status(400).json({ error: 'Invalid characters in path' });
  }

  if (path.includes('..') || decodeURIComponent(path).includes('..')) {
    return res.status(400).json({ error: 'Path traversal is not allowed' });
  }

  const baseUrl = CMS_URIS[env];

  try {
    const cmsResponse = await axios.get(`${baseUrl}/${path}`, {
      params: queryParams,
    });

    return res.status(200).json(cmsResponse.data);
  } catch (err) {
    console.error('CMS fetch error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch content from CMS' });
  }
};

router.route('/:path(*)').get(getContentFromCms);

module.exports = { cmsRouter: router, getContentFromCms, CMS_URIS };
