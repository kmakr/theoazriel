function removeSecretClass() {
  const el = document.querySelector("#secret");
  console.log(el);
  console.log("clicked");
  el.classList.remove("secret");
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
