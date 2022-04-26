exports.sanitizeFilePath = (filename, destination) => {
  const santizedFilename = filename.replace(/(?:\.\.)|(?:\/)|(?:~\/)/g, '');
  return `${destination}/${santizedFilename}`;
};
