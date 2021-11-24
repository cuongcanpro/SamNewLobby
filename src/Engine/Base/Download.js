/**
 * Created by sonbnt on 23/02/2021.
 */

DOWNLOAD_ERROR = {
    SUCCESS:100,
    FILE_UP_TO_DATE:2,
    FINISH_ONE_FILE:1,
    FAILED:-1,
    NOT_SUPPORT_DOWNLOAD: -2
};

fr.download = {
    ERR_SUCCESS: -1,
    downloadFile: function(url, desUrl, md5, callback) {
        fr.NativeService.downloadFile(url, desUrl, md5, callback);
    },
    deleteFile:function(path) {
        jsb.fileUtils.removeFile(path);
    }
};
