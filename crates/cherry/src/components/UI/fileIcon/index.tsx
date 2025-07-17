

import fileSvg from './file'
import HtmlSvg from './html'
import pdfSvg from './pdf'
import DocSvg from './doc'
import XlsSvg from './xls'
import PptSvg from './ppt'
import ZipSvg from './zip'
import AudioSvg from './audio'
import VideoSvg from './video'
import ImgSvg from './img'
import TextSvg from './text'

export const getFileSvg = (mimeType: string) => {
    // 判断主要MIME类型
    if (!mimeType || typeof mimeType !== 'string') {
        return fileSvg;
    }

    const lowerMime = mimeType.toLowerCase();

    // 文档类型
    if (lowerMime.includes('pdf') || lowerMime === 'application/pdf') {
        return pdfSvg;
    } else if (lowerMime.includes('word') || lowerMime.includes('document') || 
               lowerMime === 'application/msword' || lowerMime.includes('officedocument.wordprocessing')) {
        return DocSvg;
    } else if (lowerMime.includes('excel') || lowerMime.includes('spreadsheet') || 
               lowerMime === 'application/vnd.ms-excel' || lowerMime.includes('officedocument.spreadsheet')) {
        return XlsSvg;
    } else if (lowerMime.includes('powerpoint') || lowerMime.includes('presentation') || 
               lowerMime === 'application/vnd.ms-powerpoint' || lowerMime.includes('officedocument.presentation')) {
        return PptSvg;
    } 
    // 压缩文件类型
    else if (lowerMime.includes('zip') || lowerMime.includes('rar') || lowerMime.includes('7z') || 
             lowerMime.includes('tar') || lowerMime.includes('gz') || lowerMime.includes('compress')) {
        return ZipSvg;
    } 
    // 音频文件类型
    else if (lowerMime.includes('audio')) {
        return AudioSvg;
    } 
    // 视频文件类型
    else if (lowerMime.includes('video')) {
        return VideoSvg;
    } 
    // 图像文件类型
    else if (lowerMime.includes('image')) {
        return ImgSvg;
    } 
    // 文本文件类型
    else if (lowerMime.includes('text/plain') || lowerMime.includes('txt')) {
        return TextSvg;
    }
    // HTML文件类型
    else if (lowerMime.includes('html') || lowerMime === 'text/html') {
        return HtmlSvg;
    }
    // 默认返回通用文件图标
    else {
        return fileSvg;
    }
}