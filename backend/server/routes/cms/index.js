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

  if (!path) return res.status(400).json({ error: 'Missing path' });
  if (!env) return res.status(400).json({ error: 'Missing env' });

  const baseUrl = CMS_URIS[env];

  if (!baseUrl) return res.status(400).json({ error: 'Invalid environment specified' });

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
