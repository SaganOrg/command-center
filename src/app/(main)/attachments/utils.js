const getIconForType = (type) => {
    switch (type) {
      case 'image':
        return 'ImageIcon';
      case 'file':
        return 'FileArchive';
      case 'database':
        return 'TableIcon';
      case 'text':
      default:
        return 'TypeIcon';
    }
  };
  
  module.exports = { getIconForType };