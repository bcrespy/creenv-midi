/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * Creates a triggered link pointing to the blob sent as parameter
 */

class BlobDownload {
  /**
   * @param {Blob} blob 
   * @param {string} filename
   */
  constructor (blob, filename) {
    const link = document.createElement('a');
    link.style.display = 'none';

    const downloadUrl = window.URL.createObjectURL(blob);
    link.href = downloadUrl;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

export default BlobDownload;