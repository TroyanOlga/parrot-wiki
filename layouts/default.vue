<template>
  <div>
    <link
      rel="preload"
      as="style"
      href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;900&display=swap"
      crossorigin="anonymous"
      onload="this.rel='stylesheet'"
    />
    <Nuxt />
  </div>
</template>

<style lang="scss">
body {
  font-family: 'Work Sans', sans-serif;
  font-weight: 400;
  line-height: 1.25;
  .title,
  .subtitle {
    word-break: unset;
    overflow-wrap: break-word;
    hyphens: auto;
  }
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
h1.title {
  font-family: 'Work Sans', sans-serif;
  display: block;
  font-weight: 900;
  font-size: 100px;
  letter-spacing: 1px;
  z-index: 1;
  @media only screen and (max-width: 812px) {
    font-size: 50px;
    background-color: #fee473 !important;
    color: black !important;
  }
}
</style>
