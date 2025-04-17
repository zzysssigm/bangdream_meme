<template>
    <div class="meme-generator">
        <div class="canvas-and-ycontrol">
            <!-- 图像显示区域 -->
            <div class="canvas-wrapper">
                <div class="canvas">
                    <img :src="imageSrc" alt="meme" class="background" :style="imageStyle" @load="adjustImageSize" />
                    <div class="text-overlay" :style="{
                        transform: `translate(${xOffset}px, ${-yOffset}px) rotate(${rotate}deg)`,
                        width: 'max-content'
                    }">
                        <span :style="{
                            fontSize: `${fontSize}px`,
                            letterSpacing: `${spacing}px`,
                            fontFamily: fontFamily,
                            fontWeight: fontWeight,
                            color: fontColor,
                            textShadow: textShadowStyle,
                            whiteSpace: wrapText ? 'pre' : 'nowrap',
                        }">
                            {{ smartWrappedText }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Y轴滑杆 -->
            <div class="y-control">
                <label for="yOffset">文字纵向位置:</label>
                <input id="yOffset" type="range" v-model="yOffset" min="-350" max="350" orient="vertical"
                    @input="saveSettings" />
            </div>
        </div>

        <!-- 主要控制区域 -->
        <div class="main-controls">
            <button @click="isSelectorVisible = true">选择表情包</button>

            <div class="control-group">
                <label for="text">内容:</label>
                <input id="text" v-model="text" type="text" placeholder="输入文字" @input="saveSettings" />
            </div>

            <div class="control-group">
                <label for="xOffset">文字横向位置:</label>
                <input id="xOffset" type="range" v-model="xOffset" min="-350" max="350" @input="saveSettings" />
            </div>

            <div class="control-group">
                <label for="fontSize">字体大小:</label>
                <input id="fontSize" type="range" v-model="fontSize" min="10" max="100" @input="saveSettings" />
            </div>

            <button class="toggle-advanced" @click="showAdvanced = !showAdvanced">
                {{ showAdvanced ? '隐藏高级设置' : '显示高级设置' }}
            </button>

            <!-- 高级设置区域 -->
            <div class="advanced-controls" v-if="showAdvanced">
                <div class="control-group">
                    <label for="rotate">旋转:</label>
                    <input id="rotate" type="range" v-model="rotate" min="-180" max="180" @input="saveSettings" />
                </div>

                <div class="control-group">
                    <label for="spacing">字间距:</label>
                    <input id="spacing" type="range" v-model="spacing" min="0" max="20" @input="saveSettings" />
                </div>

                <div class="control-group">
                    <label for="fontWeight">字重:</label>
                    <input id="fontWeight" type="range" v-model="fontWeight" min="100" max="900" step="100"
                        @input="saveSettings" />
                </div>

                <div class="control-group">
                    <label for="borderSize">边框大小:</label>
                    <input id="borderSize" type="range" v-model="borderSize" min="0" max="5" step="0.5"
                        @input="saveSettings" />
                </div>

                <div class="control-group">
                    <label for="borderColor">边框颜色:</label>
                    <input id="borderColor" type="color" v-model="borderColor" @input="saveSettings" />
                </div>

                <div class="control-group">
                    <label for="fontFamily">字体:</label>
                    <select id="fontFamily" v-model="fontFamily" @change="saveSettings">
                        <option value="'XiMai', sans-serif">喜鹊招牌体(核心科技)</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Courier New', Courier, monospace">Courier New</option>
                        <option value="'Times New Roman', Times, serif">Times New Roman</option>
                        <option value="'Comic Sans MS', cursive, sans-serif">Comic Sans MS</option>
                        <option value="'Verdana', Geneva, sans-serif">Verdana</option>
                        <option value="'SimSun', serif">SimSun (宋体)</option>
                        <option value="'SimHei', sans-serif">SimHei (黑体)</option>
                        <option value="'Microsoft YaHei', sans-serif" selected>Microsoft YaHei (微软雅黑)</option>
                        <option value="'KaiTi', serif">KaiTi (楷体)</option>
                        <option value="'FangSong', serif">FangSong (仿宋)</option>
                    </select>
                </div>

                <div class="control-group">
                    <label for="fontColor">字体颜色:</label>
                    <input id="fontColor" type="color" v-model="fontColor" @input="saveSettings" />
                </div>

                <div class="control-group">
                    <label for="wrapText">自动换行:</label>
                    <input id="wrapText" type="checkbox" v-model="wrapText" @change="saveSettings" />
                </div>
            </div>

            <div class="action-buttons">
                <button @click="captureScreenshot" :disabled="isCapturing">
                    {{ isCapturing ? '截图中...' : '复制到剪贴板' }}
                </button>
                <button @click="saveScreenshotToGallery" :disabled="isCapturing">
                    {{ isCapturing ? '保存中...' : '保存到相册' }}
                </button>
                <button @click="resetToDefaults">恢复默认配置</button>
            </div>
        </div>

        <!-- 图片选择弹窗 -->
        <ImageSelector :isVisible="isSelectorVisible" :images="imageList" @close="isSelectorVisible = false"
            @select="updateImage" />
    </div>
</template>

<script>
/* eslint-disable */
import { ref, computed, onMounted, watch } from "vue";
import html2canvas from "html2canvas";
import ImageSelector from "@/components/ImageSelector.vue";
import UPNG from 'upng-js'; // 必须添加到文件顶部

const requireImages = require.context("@/image", false, /\.(png|jpe?g|gif|svg)$/);
const imageList = requireImages.keys().map((key) => requireImages(key));

export default {
    name: "MemeGenerator",
    components: { ImageSelector },
    setup() {
        const showAdvanced = ref(false);
        const isCapturing = ref(false);
        const imageSrc = ref(imageList[0]);
        const imageStyle = ref({});

        // 默认配置
        const defaultSettings = window.matchMedia("(max-width: 800px)").matches
            ? {
                rotate: 0,
                fontSize: 35,
                spacing: 0,
                xOffset: -100,
                yOffset: -50,
                fontWeight: 600,
                wrapText: false,
                text: "BanGDream!",
                fontFamily: "'XiMai', sans-serif",
                fontColor: "#ffffff",
                borderSize: 1,
                borderColor: "#000000"
            }
            : {
                rotate: 0,
                fontSize: 35,
                spacing: 0,
                xOffset: -100,
                yOffset: -100,
                fontWeight: 600,
                wrapText: false,
                text: "BanGDream!",
                fontFamily: "'XiMai', sans-serif",
                fontColor: "#ffffff",
                borderSize: 1,
                borderColor: "#000000"
            };

        const rotate = ref(defaultSettings.rotate);
        const fontSize = ref(defaultSettings.fontSize);
        const spacing = ref(defaultSettings.spacing);
        const xOffset = ref(defaultSettings.xOffset);
        const yOffset = ref(defaultSettings.yOffset);
        const fontWeight = ref(defaultSettings.fontWeight);
        const wrapText = ref(defaultSettings.wrapText);
        const text = ref(defaultSettings.text);
        const borderSize = ref(defaultSettings.borderSize);
        const borderColor = ref(defaultSettings.borderColor);
        const fontFamily = ref(defaultSettings.fontFamily);
        const fontColor = ref(defaultSettings.fontColor);
        const isSelectorVisible = ref(false);

        const adjustImageSize = (event) => {
            const img = event.target;
            const container = img.parentElement; // .canvas 元素
            const canvasWrapper = container.parentElement; // .canvas-wrapper 容器

            // 重置图片样式
            img.style.width = '';
            img.style.height = '';

            // 获取容器和图片原始尺寸
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;

            // 计算最佳缩放比例（使用 cover 模式填满容器）
            const scale = Math.max(containerWidth / imgWidth, containerHeight / imgHeight);
            const scaledWidth = imgWidth * scale;
            const scaledHeight = imgHeight * scale;

            // 设置图片样式
            imageStyle.value = {
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                objectFit: 'cover' // 改为 cover 模式填满容器
            };

            // 同步调整容器尺寸
            container.style.width = `${scaledWidth}px`;
            container.style.height = `${scaledHeight}px`;
            canvasWrapper.style.width = `${scaledWidth}px`;
            canvasWrapper.style.height = `${scaledHeight}px`;
        };

        // 更新选中的图片
        const updateImage = (selectedImage) => {
            imageSrc.value = selectedImage;
        };

        // 计算文本阴影样式
        const textShadowStyle = computed(() => {
            if (borderSize.value <= 0) return 'none';
            const size = borderSize.value;
            return `
                -${size}px -${size}px 0 ${borderColor.value},
                ${size}px -${size}px 0 ${borderColor.value},
                -${size}px ${size}px 0 ${borderColor.value},
                ${size}px ${size}px 0 ${borderColor.value}
            `;
        });

        // 判断字符是否是标点符号
        const isPunctuation = (char) => {
            const punctuationRegex = /[，。、；：！？「」『』【】《》（）"",.;:!?'"«»(){}[\]-]/;
            return punctuationRegex.test(char);
        };

        // 计算智能换行后的文本
        const smartWrappedText = computed(() => {
            if (!wrapText.value || !text.value) return text.value;

            const str = text.value;
            if (str.includes('\n')) return str;

            const midIndex = Math.floor(str.length / 2);
            let breakPos = midIndex;

            // 向右查找非标点位置
            for (let i = midIndex; i < Math.min(midIndex + 5, str.length); i++) {
                if (!isPunctuation(str[i])) {
                    breakPos = i;
                    break;
                }
            }

            // 向左查找
            if (breakPos === midIndex) {
                for (let i = midIndex; i >= Math.max(0, midIndex - 5); i--) {
                    if (!isPunctuation(str[i])) {
                        breakPos = i;
                        break;
                    }
                }
            }

            return str.substring(0, breakPos) + '\n' + str.substring(breakPos);
        });

        // 新增图片压缩方法
        const compressImage = async (canvas, maxSize = 1000000) => {
            let quality = 0.9;
            let blob = await new Promise(resolve =>
                canvas.toBlob(resolve, 'image/jpeg', quality)
            );

            while (blob.size > maxSize && quality > 0.4) {
                quality -= 0.1;
                blob = await new Promise(resolve =>
                    canvas.toBlob(resolve, 'image/jpeg', quality)
                );
            }

            if (blob.size > maxSize) {
                const scale = Math.sqrt(maxSize / blob.size);
                const resizedCanvas = document.createElement('canvas');
                resizedCanvas.width = canvas.width * scale;
                resizedCanvas.height = canvas.height * scale;
                const ctx = resizedCanvas.getContext('2d');
                ctx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
                blob = await new Promise(resolve =>
                    resizedCanvas.toBlob(resolve, 'image/jpeg', 0.8)
                );
            }

            return blob;
        };

        const compressImage_png = async (canvas) => {
            try {
                // 获取原始图像数据
                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // 使用UPNG进行无损压缩
                const compressed = UPNG.encode(
                    [imageData.data.buffer], // 图像数据
                    canvas.width,
                    canvas.height,
                    256 // 颜色位数（0-256）
                );

                return new Blob([compressed], { type: 'image/png' });
            } catch (error) {
                console.error('压缩失败:', error);
                throw new Error('图片优化失败');
            }
        };
        // 通用的截图配置
        const getCanvasConfig = () => ({
            useCORS: true,
            backgroundColor: null,
            scale: window.devicePixelRatio * 2,
            logging: false,
            allowTaint: true,
            // 移除可能干扰的ignoreElements配置
            onclone: (clonedDoc, originalElement) => {
                // 确保使用克隆文档进行查找
                const wrapper = clonedDoc.querySelector('.canvas-wrapper');
                const canvas = clonedDoc.querySelector('.canvas');
                const background = clonedDoc.querySelector('.background');

                // 防御性检查
                if (!wrapper || !canvas || !background) {
                    console.error('克隆元素缺失:', { wrapper, canvas, background });
                    return;
                }

                // 同步原始元素的尺寸到克隆元素
                const originalWrapper = originalElement.querySelector('.canvas-wrapper');
                if (originalWrapper) {
                    wrapper.style.width = `${originalWrapper.offsetWidth}px`;
                    wrapper.style.height = `${originalWrapper.offsetHeight}px`;
                }

                // 强制应用必要样式
                [wrapper, canvas, background].forEach(el => {
                    el.style.background = 'transparent';
                    el.style.padding = '0';
                    el.style.margin = '0';
                    el.style.border = 'none';
                    el.style.boxSizing = 'border-box';
                });

                // 添加调试边界（正式环境可移除）
                // wrapper.style.border = '1px dashed #ff0000';
            }
        });

        // 统一的截图执行函数
        const executeScreenshot = async (isSaveAction = false) => {
            isCapturing.value = true;
            try {
                // 使用更可靠的元素获取方式
                const originalWrapper = document.querySelector('.canvas-wrapper');
                if (!originalWrapper) {
                    throw new Error('无法找到画布容器');
                }

                // 等待下一个事件循环确保DOM更新
                await new Promise(resolve => setTimeout(resolve, 50));

                const canvas = await html2canvas(originalWrapper, {
                    ...getCanvasConfig(),
                    windowWidth: originalWrapper.scrollWidth * (isSaveAction ? 2 : 1),
                    windowHeight: originalWrapper.scrollHeight * (isSaveAction ? 2 : 1),
                    // 添加异步加载等待
                    async: true,
                    // 增强渲染等待
                    imageTimeout: 10000,
                    proxy: {
                        enable: true,
                        timeout: 30000
                    }
                });

                return canvas;
            } catch (error) {
                console.error('截图核心错误:', error);
                throw error;
            } finally {
                isCapturing.value = false;
            }
        };

        // 4. 修改截图方法
        const captureScreenshot = async () => {
            try {
                const canvas = await executeScreenshot();
                const blob = await compressImage_png(canvas);

                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                alert('当前复制到剪切板会出现bug，建议使用本地保存！');
            } catch (error) {
                console.error('复制失败:', error);
                alert(`操作失败: ${error.message}`);
            }
        };
        // 修改后的保存方法
        const saveScreenshotToGallery = async () => {
            try {
                const canvas = await executeScreenshot(true);
                const blob = await compressImage(canvas);

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `meme-${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 1000);
            } catch (error) {
                alert(`保存失败: ${error.message}`);
            }
        };

        // 恢复默认配置
        const resetToDefaults = () => {
            rotate.value = defaultSettings.rotate;
            fontSize.value = defaultSettings.fontSize;
            spacing.value = defaultSettings.spacing;
            xOffset.value = defaultSettings.xOffset;
            yOffset.value = defaultSettings.yOffset;
            fontWeight.value = defaultSettings.fontWeight;
            wrapText.value = defaultSettings.wrapText;
            text.value = defaultSettings.text;
            fontFamily.value = defaultSettings.fontFamily;
            fontColor.value = defaultSettings.fontColor;
            borderSize.value = defaultSettings.borderSize;
            borderColor.value = defaultSettings.borderColor;
            saveSettings();
        };

        // 保存设置
        const saveSettings = () => {
            const settings = {
                rotate: rotate.value,
                fontSize: fontSize.value,
                spacing: spacing.value,
                xOffset: xOffset.value,
                yOffset: yOffset.value,
                fontWeight: fontWeight.value,
                wrapText: wrapText.value,
                text: text.value,
                fontFamily: fontFamily.value,
                fontColor: fontColor.value,
                borderSize: borderSize.value,
                borderColor: borderColor.value
            };
            localStorage.setItem("memeSettings", JSON.stringify(settings));
        };

        // 加载设置
        const loadSettings = () => {
            const savedSettings = JSON.parse(localStorage.getItem("memeSettings"));
            if (savedSettings) {
                rotate.value = savedSettings.rotate || rotate.value;
                fontSize.value = savedSettings.fontSize || fontSize.value;
                spacing.value = savedSettings.spacing || spacing.value;
                xOffset.value = savedSettings.xOffset || xOffset.value;
                yOffset.value = savedSettings.yOffset || yOffset.value;
                fontWeight.value = savedSettings.fontWeight || fontWeight.value;
                wrapText.value = savedSettings.wrapText || wrapText.value;
                text.value = savedSettings.text || text.value;
                fontFamily.value = savedSettings.fontFamily || fontFamily.value;
                fontColor.value = savedSettings.fontColor || fontColor.value;
                borderSize.value = savedSettings.borderSize ?? borderSize.value;
                borderColor.value = savedSettings.borderColor ?? borderColor.value;
            }
        };

        onMounted(() => {
            loadSettings();
        });

        return {
            showAdvanced,
            isCapturing,
            imageList,
            imageSrc,
            isSelectorVisible,
            updateImage,
            xOffset,
            yOffset,
            rotate,
            fontSize,
            spacing,
            fontWeight,
            fontFamily,
            fontColor,
            wrapText,
            text,
            borderSize,
            borderColor,
            textShadowStyle,
            smartWrappedText,
            imageStyle,
            adjustImageSize,
            captureScreenshot,
            saveScreenshotToGallery,
            resetToDefaults,
            saveSettings
        };
    },
};
</script>

<style scoped>
/* @media (max-width: 800px) {
    .meme-generator {
        padding: 15px;
    }
    
    .canvas-and-ycontrol {
        flex-direction: column;
    }
    
    .y-control {
        position: absolute;
        right: 10px;
        top: 10px;
        background-color: rgba(40, 40, 40, 0.8);
        padding: 8px;
        border-radius: 8px;
        flex-direction: row;
    }
    
    input[type="range"][orient="vertical"] {
        height: 120px;
        width: 8px;
    }
    
    .advanced-controls {
        grid-template-columns: 1fr;
    }
    
    .action-buttons button {
        flex: 1 1 100%;
    }
} */
@media (max-width: 800px) {

    /* 核心容器优化 */
    .canvas-wrapper {
        width: auto !important;
        height: auto !important;
        display: inline-block;
        background: transparent;
        margin: 0 auto;
        line-height: 0;
        /* 消除图片底部间隙 */
    }

    /* 画布尺寸控制 */
    .canvas {
        position: relative;
        background: transparent !important;
        width: auto !important;
        height: auto !important;
        overflow: hidden;
        border-radius: 8px;
    }

    /* 图片强制填充 */
    .background {
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        position: relative;
        z-index: 1;
    }

    /* 文本层定位优化 */
    .text-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 2;
        transform: translate(-50%, -50%);
        pointer-events: none;
    }

    /* 滑杆控件优化 */
    .y-control {
        order: -1;
        width: 100%;
        margin: 10px 0;
    }

    input[type="range"][orient="vertical"] {
        height: 8px !important;
        width: 80% !important;
        writing-mode: horizontal-tb;
    }

    /* 按钮间距优化 */
    .action-buttons button {
        margin: 5px 0;
        padding: 12px;
    }

    /* 统一输入控件样式 */
    input[type="text"],
    select {
        font-size: 16px !important;
        padding: 12px !important;
    }

    /* 截图容器边界处理 */
    .canvas-wrapper::after {
        content: "";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 1px solid rgb(10, 10, 10);
        pointer-events: none;
        z-index: 3;
    }

    /* 统一字体 */
    .meme-generator,
    input[type="text"],
    select,
    button {
        font-family: Arial, sans-serif;
        font-size: 0.95em;
        /* 与PC端字号同步 */
    }

    /* 输入框颜色 & 圆角 */
    input[type="text"],
    select {
        border: 1px solid #444 !important;
        /* PC端边框色 */
        border-radius: 6px !important;
        /* PC端圆角值 */
        background-color: #333 !important;
        /* PC端背景色 */
        color: #fff !important;
        /* 文字色同步 */
        height: 12px;
    }

    /* 滑杆颜色风格 */
    input[type="range"] {
        background: #444 !important;
        /* 轨道背景色 */
        border-radius: 4px !important;
        /* 轨道圆角 */
    }

    input[type="range"]::-webkit-slider-thumb {
        background: #ff69b4 !important;
        /* 滑块颜色 */
        width: 18px !important;
        /* 滑块尺寸 */
        height: 18px !important;
    }

    /* 按钮视觉同步 */
    button {
        background-color: #ff69b4 !important;
        /* 品牌粉色 */
        border-radius: 6px !important;
        /* 统一圆角 */
        color: #fff !important;
        /* 文字颜色 */
        font-weight: bold !important;
        /* 加粗字体 */
        margin: 7px;
    }

    input[type="text"] {
        width: 70%;
        padding: 10px 12px;
        font-size: 0.95em;
        font-weight: bold;
        border: 1px solid #444;
        border-radius: 6px;
        background-color: #333;
        color: #fff;
        outline: none;
    }

}

@media only screen and (min-width: 801px) {
    .meme-generator {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #fff;
        background-color: #1c1c1c;
        padding: 30px;
        font-family: Arial, sans-serif;
        font-size: 0.95em;
        font-weight: bold;
        /* 修改以下属性使背景覆盖全屏 */
        min-height: 100vh;
        /* 确保至少覆盖整个视口高度 */
        width: 100%;
        /* 覆盖整个宽度 */
        box-sizing: border-box;
        /* 包含padding在内的宽度计算 */
    }

    .canvas-and-ycontrol {
        display: flex;
        align-items: center;
        gap: 30px;
        margin-bottom: 30px;
        width: 100%;
        justify-content: center;
    }

    .canvas-wrapper {
        display: inline-block;
        position: relative;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .canvas {
        position: relative;
        background-color: #2a2a2a;
    }

    .background {
        display: block;
        max-width: 100%;
        height: auto;
        border-radius: 6px;
    }

    .text-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
    }

    .main-controls {
        display: flex;
        flex-direction: column;
        gap: 20px;
        width: 450px;
        background-color: #252525;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .control-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
    }

    .control-group label {
        color: #e0e0e0;
        font-size: 0.95em;
    }

    input[type="range"] {
        width: 100%;
        height: 8px;
        background: #444;
        border-radius: 4px;
        outline: none;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        background: #ff69b4;
        border-radius: 50%;
        cursor: pointer;
    }

    input[type="text"] {
        width: 100%;
        padding: 10px 12px;
        font-size: 0.95em;
        font-weight: bold;
        border: 1px solid #444;
        border-radius: 6px;
        background-color: #333;
        color: #fff;
        outline: none;
    }

    input[type="text"]:focus {
        border-color: #ff69b4;
    }

    select {
        width: 100%;
        padding: 10px 12px;
        font-size: 0.95em;
        font-weight: bold;
        border: 1px solid #444;
        border-radius: 6px;
        background-color: #333;
        color: #fff;
        outline: none;
        cursor: pointer;
    }

    select:focus {
        border-color: #ff69b4;
    }

    button {
        padding: 10px 15px;
        font-size: 0.95em;
        font-weight: bold;
        border: none;
        border-radius: 6px;
        background-color: #ff69b4;
        color: #fff;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    button:hover {
        background-color: #ff4785;
        transform: translateY(-2px);
    }

    .toggle-advanced {
        margin: 10px 0;
        background-color: #444;
        color: #e0e0e0;
    }

    .toggle-advanced:hover {
        background-color: #555;
    }

    .y-control {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
    }

    .y-control label {
        color: #e0e0e0;
        font-size: 0.95em;
    }

    input[type="range"][orient="vertical"] {
        -webkit-appearance: slider-vertical;
        writing-mode: bt-lr;
        width: 10px;
        height: 350px;
        margin: 0 15px;
        background: #444;
    }

    .y-control input[type="range"]::-webkit-slider-thumb {
        width: 18px;
        height: 18px;
        background: #ff69b4;
    }

    .advanced-controls {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        padding: 20px;
        background-color: #2a2a2a;
        border-radius: 8px;
        margin-top: 10px;
    }

    .action-buttons {
        display: flex;
        gap: 12px;
        margin-top: 15px;
    }

    .action-buttons button {
        flex: 1;
    }

    input[type="color"] {
        width: 100%;
        height: 36px;
        border: 1px solid #444;
        border-radius: 6px;
        background: #333;
        cursor: pointer;
    }

    input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #ff69b4;
        cursor: pointer;
    }

    .text-overlay span {
        display: inline-block;
        white-space: pre-line;
        /* 保留手动换行 */
        line-height: 1.2;
        /* 调整行高 */
    }

    .canvas {
        white-space: pre-wrap;
        /* 保留换行符 */
    }
}

/* 响应式调整 */
@media (max-width: 1000px) {
    .meme-generator {
        padding: 20px;
    }

    .canvas-and-ycontrol {
        flex-direction: column;
    }

    .y-control {
        flex-direction: row;
        margin-top: 20px;
    }

    input[type="range"][orient="vertical"] {
        height: 10px;
        width: 200px;
        writing-mode: horizontal-tb;
    }

    .advanced-controls {
        grid-template-columns: 1fr;
    }
}
</style>