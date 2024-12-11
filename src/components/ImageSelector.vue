<template>
    <div class="image-selector" v-if="isVisible">
      <div class="overlay" @click="close"></div>
      <div class="modal">
        <h3>选择表情包</h3>
        <div class="image-grid">
          <img
            v-for="(img, index) in images"
            :key="index"
            :src="img"
            :alt="'表情包' + index"
            class="image-item"
            @click="selectImage(img)"
          />
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
    methods: {
      close() {
        this.$emit("close");
      },
      selectImage(img) {
        this.$emit("select", img);
        this.close();
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
  </style>
  