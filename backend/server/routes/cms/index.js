var axios = require('axios');
var express = require('express');
const cacheCMSReponse = require('../../utils/cacheCMSReponse');
const config = require('../../config/config');

const router = express.Router();

const CMS_BASE_URL = config.get('cms.url');

const getContentFromCms = async (req, res) => {
  const { env, ...queryParams } = req.query;
  const path = req.params.path;

  if (!path || typeof path !== 'string') return res.status(400).json({ error: 'Missing or invalid path' });

  if (!/^[a-zA-Z0-9/_-]+$/.test(path)) {
    return res.status(400).json({ error: 'Invalid characters in path' });
  }

  if (path.includes('..') || decodeURIComponent(path).includes('..')) {
    return res.status(400).json({ error: 'Path traversal is not allowed' });
  }

  const baseUrl = CMS_BASE_URL;

  try {
    const cmsResponse = await axios.get(`${baseUrl}/${path}`, {
      params: queryParams,
    });

    await cacheCMSReponse.cacheCMSResponse(req.url, cmsResponse.data);

    return res.status(200).json(cmsResponse.data);
  } catch (err) {
    console.error('CMS fetch error:', err.response?.data || err.message || err);

    const dataFromCache = await cacheCMSReponse.getCMSResponseFromCache(req.url);
    if (dataFromCache) {
      console.log('respond to frontend with data from cache');
      return res.status(200).json(dataFromCache);
    }
    res.status(500).json({ error: 'Failed to fetch content from CMS', action: 'NO_REDIRECT' });
  }
};

router.route('/:path(*)').get(getContentFromCms);

module.exports = { cmsRouter: router, getContentFromCms };
