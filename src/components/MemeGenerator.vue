<template>
    <div class="meme-generator">
        <div class="canvas-and-ycontrol">
            <!-- 图像显示区域 -->
            <div class="canvas-wrapper">
                <div class="canvas" ref="canvasRef">
                    <img :src="imageSrc" alt="meme" class="background" :style="imageStyle" @load="adjustImageSize" />
                    <div class="text-overlay" :style="{
                        transform: `translate(${xOffset}px, ${-yOffset}px) rotate(${rotate}deg)`
                    }">
                        <span :style="{
                            fontSize: `${fontSize}px`,
                            letterSpacing: `${spacing}px`,
                            fontFamily: fontFamily,
                            fontWeight: fontWeight,
                            color: fontColor,
                            textShadow: `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`,
                            whiteSpace: wrapText ? 'normal' : 'nowrap'
                        }">
                            {{ text }}
                        </span>
                    </div>
                </div>

            </div>

            <!-- Y轴滑杆 -->
            <div class="y-control">
                <label for="yOffset">Y Position:</label>
                <input id="yOffset" type="range" v-model="yOffset" min="-250" max="250" orient="vertical"
                    @input="saveSettings" />
            </div>
        </div>

        <!-- 其他滑杆设置区域 -->
        <div class="controls left-align">
            <button @click="isSelectorVisible = true">选择表情包</button>

            <label for="xOffset">X Position:</label>
            <input id="xOffset" type="range" v-model="xOffset" min="-250" max="250" @input="saveSettings" />

            <label for="rotate">Rotate:</label>
            <input id="rotate" type="range" v-model="rotate" min="-180" max="180" @input="saveSettings" />

            <label for="fontSize">Font size:</label>
            <input id="fontSize" type="range" v-model="fontSize" min="10" max="100" @input="saveSettings" />

            <label for="spacing">Spacing:</label>
            <input id="spacing" type="range" v-model="spacing" min="0" max="20" @input="saveSettings" />

            <label for="fontWeight">Font Weight:</label>
            <input id="fontWeight" type="range" v-model="fontWeight" min="100" max="900" step="100"
                @input="saveSettings" />

            <label for="fontFamily">Font:</label>
            <select id="fontFamily" v-model="fontFamily" @change="saveSettings">
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
                <option value="'Zcool KuaiLe', cursive">Zcool KuaiLe (站酷快乐体)</option>
                <option value="'MaShanZheng', cursive">MaShanZheng (马善政)</option>
            </select>

            <label for="fontColor">Font Color:</label>
            <input id="fontColor" type="color" v-model="fontColor" @input="saveSettings" />

            <label for="wrapText">Auto Wrap Text:</label>
            <input id="wrapText" type="checkbox" v-model="wrapText" @change="saveSettings" />

            <label for="text">Text:</label>
            <input id="text" v-model="text" type="text" placeholder="Enter text" @input="saveSettings" />

            <button @click="captureScreenshot">Copy to Clipboard</button>
            <button @click="saveScreenshotToGallery">Save to Gallery</button>
            <button @click="resetToDefaults">恢复默认配置</button>
        </div>

        <!-- 图片选择弹窗 -->
        <ImageSelector :isVisible="isSelectorVisible" :images="imageList" @close="isSelectorVisible = false"
            @select="updateImage" />
    </div>
</template>

<script>
/* eslint-disable */
import { ref, onMounted } from "vue";
import html2canvas from "html2canvas";
import ImageSelector from "@/components/ImageSelector.vue";

// 动态读取 @/image 目录下的所有图片
const requireImages = require.context("@/image", false, /\.(png|jpe?g|gif|svg)$/);
const imageList = requireImages.keys().map((key) => requireImages(key));

export default {
    name: "MemeGenerator",
    components: { ImageSelector },
    setup() {
        // 默认选中的图片
        const imageSrc = ref(imageList[0]);

        const imageStyle = ref({}); // 用于动态设置图片宽高
        const maxWidth = 500; // 最大宽度
        const maxHeight = 400; // 最大高度

        // 调整图片尺寸（包括等比放大和缩小）
        const adjustImageSize = (event) => {
            const img = event.target;
            const { naturalWidth, naturalHeight } = img;

            // 计算宽高比例
            const widthRatio = maxWidth / naturalWidth;
            const heightRatio = maxHeight / naturalHeight;

            // 取较小的比例，确保等比缩放
            const scale = Math.min(widthRatio, heightRatio);

            // 计算放大后的宽高
            const newWidth = naturalWidth * scale;
            const newHeight = naturalHeight * scale;

            imageStyle.value = {
                width: `${newWidth}px`,
                height: `${newHeight}px`,
            };
        };

        // 控制图片选择器显示
        const isSelectorVisible = ref(false);

        // 更新选中的图片
        const updateImage = (selectedImage) => {
            imageSrc.value = selectedImage;
        };

        // 默认配置
        const defaultSettings = window.matchMedia("(max-width: 800px)").matches
            ? {
                rotate: 0,
                fontSize: 35,
                spacing: 0,
                xOffset: 0,
                yOffset: 50,
                fontWeight: 600,
                wrapText: false,
                text: "BanGDream!",
                fontFamily: "Microsoft YaHei, sans-serif",
                fontColor: "#ffffff",
            }
            : {
                rotate: 0,
                fontSize: 35,
                spacing: 0,
                xOffset: -110,
                yOffset: -100,
                fontWeight: 600,
                wrapText: false,
                text: "BanGDream!",
                fontFamily: "Microsoft YaHei, sans-serif",
                fontColor: "#ffffff",
            };

        const rotate = ref(defaultSettings.rotate);
        const fontSize = ref(defaultSettings.fontSize);
        const spacing = ref(defaultSettings.spacing);
        const xOffset = ref(defaultSettings.xOffset);
        const yOffset = ref(defaultSettings.yOffset);
        const fontWeight = ref(defaultSettings.fontWeight);
        const wrapText = ref(defaultSettings.wrapText);
        const text = ref(defaultSettings.text);

        // 字体选择
        const fontFamily = ref(defaultSettings.fontFamily);

        // 字体颜色
        const fontColor = ref(defaultSettings.fontColor);


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

            // 可选：同步更新本地存储
            saveSettings();
        };

        const captureScreenshot = async () => {
            const canvasWrapper = document.querySelector(".canvas-wrapper");

            try {
                const canvas = await html2canvas(canvasWrapper, {
                    useCORS: true,
                    backgroundColor: null,
                });

                canvas.toBlob((blob) => {
                    const item = new ClipboardItem({ "image/png": blob });
                    navigator.clipboard.write([item]).then(
                        () => alert("Copied to clipboard!"),
                        () => alert("Failed to copy!")
                    );
                });
            } catch (error) {
                console.error("Screenshot failed:", error);
            }
        };

        const saveScreenshotToGallery = async () => {
            const canvasWrapper = document.querySelector(".canvas-wrapper");

            try {
                const canvas = await html2canvas(canvasWrapper, {
                    useCORS: true,
                    backgroundColor: null,
                });

                const link = document.createElement("a");
                link.download = "meme.png";
                link.href = canvas.toDataURL("image/png");
                link.click();
            } catch (error) {
                console.error("Save screenshot failed:", error);
            }
        };

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
            }
        };

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
            };
            localStorage.setItem("memeSettings", JSON.stringify(settings));
        };

        onMounted(() => {
            loadSettings();
        });

        return {
            // settings: defaultSettings,
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
            saveSettings,
            captureScreenshot,
            saveScreenshotToGallery,
            resetToDefaults,
            imageSrc,
            imageStyle,
            adjustImageSize,
        };
    },
};
</script>

<style scoped>
@import "@/assets/meme-generator.css";
</style>

<!-- <style scoped>
.meme-generator {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;
    background-color: #1c1c1c;
    padding: 50px; /* 增大整体内边距 */
    font-family: Arial, sans-serif;
    font-size: 1.5em; /* 整体字体比例增大 */
}

.canvas-and-ycontrol {
    display: flex;
    align-items: center;
    margin-bottom: 40px; /* 增大图片与控件间距 */
}

.canvas-wrapper {
    display: inline-block;
    position: relative;
    overflow: hidden; /* 防止内容溢出 */
}

.canvas {
    position: relative;
}

.background {
    display: block; /* 避免额外的 inline 间隙 */
    max-width: 100%; /* 确保图片不会超出父容器 */
    height: auto; /* 保持图片比例 */
}

.text-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.controls {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px; /* 增大控件之间的间距 */
    width: 500px; /* 放大控件区域宽度 */
}

input[type="range"] {
    width: 100%;
    height: 12px; /* 增大滑杆高度 */
}

input[type="text"] {
    width: 100%;
    padding: 15px; /* 增大输入框内边距 */
    font-size: 18px; /* 增大输入框字体 */
    border: 1px solid #ccc;
    border-radius: 6px;
}

select {
    width: 100%;
    padding: 15px; /* 增加选择框内边距 */
    font-size: 18px; /* 增大选择框字体 */
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #1c1c1c;
    color: #fff;
}

button {
    padding: 15px 20px; /* 增大按钮内边距 */
    font-size: 18px; /* 增大按钮字体 */
    border: none;
    border-radius: 6px;
    background-color: #007bff;
    color: #fff;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #0056b3;
}

.y-control {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.y-control label {
    margin-bottom: 15px;
    font-size: 1.3em; /* 增大标签字体 */
}

input[type="range"][orient="vertical"] {
    -webkit-appearance: slider-vertical;
    writing-mode: bt-lr;
    width: 14px; /* 调整垂直滑杆宽度 */
    height: 350px; /* 增大垂直滑杆高度 */
    margin: 0 20px; /* 增加滑杆间距 */
}

.y-control input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px; /* 更大的滑块 */
    height: 24px;
    background: #ff69b4;
    cursor: pointer;
    border-radius: 50%;
    border: none;
}

.y-control input[type="range"]::-moz-range-thumb {
    width: 24px; /* 更大的滑块 */
    height: 24px;
    background: #ff69b4;
    cursor: pointer;
    border-radius: 50%;
    border: none;
}
</style> -->
