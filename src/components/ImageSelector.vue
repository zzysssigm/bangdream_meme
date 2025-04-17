<template>
  <div class="image-selector" v-if="isVisible">
    <div class="overlay" @click="close"></div>
    <div class="modal">
      <h3>选择表情包</h3>
      
      <!-- 文件上传按钮 -->
      <div class="upload-section">
        <input 
          type="file" 
          id="image-upload" 
          accept="image/*" 
          @change="handleFileUpload"
          style="display: none"
        >
        <label for="image-upload" class="upload-btn">上传本地图片</label>
      </div>
      
      <!-- 图片网格 -->
      <div class="image-grid">
        <img
          v-for="(img, index) in pagedImages"
          :key="index"
          :src="img"
          :alt="'表情包 ' + index"
          class="image-item"
          @click="selectImage(img)"
        />
      </div>
      
      <!-- 分页按钮 -->
      <div class="pagination">
        <button :disabled="currentPage === 1" @click="prevPage">上一页</button>
        <span>第 {{ currentPage }} 页</span>
        <button :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
      </div>
      
      <button @click="close">取消</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ImageSelector",
  props: {
    images: {
      type: Array,
      required: true,
    },
    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["close", "select"],
  data() {
    return {
      currentPage: 1,
      imagesPerPage: 6,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.images.length / this.imagesPerPage);
    },
    pagedImages() {
      const startIndex = (this.currentPage - 1) * this.imagesPerPage;
      const endIndex = startIndex + this.imagesPerPage;
      return this.images.slice(startIndex, endIndex);
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
    selectImage(img) {
      this.$emit("select", img);
      this.close();
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
      }
    },
    // 修改后的文件上传处理方法
    handleFileUpload(event) {
      const files = event.target.files;
      if (files.length === 0) return;
      
      const file = files[0];
      if (!file.type.match('image.*')) {
        alert('请选择图片文件');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        // 直接触发选择并关闭选择器
        this.$emit("select", e.target.result);
        this.close();
        // 重置文件输入
        event.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  },
};
</script>

<style scoped>
/* 原有样式保持不变 */
.upload-section {
  margin-bottom: 20px;
}

.upload-btn {
  display: inline-block;
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upload-btn:hover {
  background-color: #218838;
}

.image-selector {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal {
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  z-index: 1001;
  width: 80%;
  max-width: 500px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.image-item {
  width: 100%;
  cursor: pointer;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.image-item:hover {
  transform: scale(1.05);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
</style>