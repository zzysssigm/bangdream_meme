<template>
  <div class="image-selector" v-if="isVisible">
    <div class="overlay" @click="close"></div>
    <div class="modal">
      <h3>选择表情包</h3>
      
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
      currentPage: 1, // 当前页
      imagesPerPage: 6, // 每页显示图片数量
    };
  },
  computed: {
    // 总页数
    totalPages() {
      return Math.ceil(this.images.length / this.imagesPerPage);
    },
    // 当前页显示的图片
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
    // 上一页
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },
    // 下一页
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
      }
    },
  },
};
</script>

<style scoped>
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
