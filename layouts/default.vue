<template>
  <div>
    <Nuxt />
  </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;900&display=swap');

body {
  font-family: 'Work Sans', sans-serif;
  font-weight: 400;
  line-height: 1.25;
}
a {
  color: inherit;
  border-bottom: dashed 1px black;
  &:hover {
    border-bottom: solid 1px;
  }
}
.container {
  margin: 0 auto;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
