const mod2 = await import.meta.globEager(`./css-myorg.css`);

const mod = await import.meta.glob("./css-myorg.css");

// https://github.com/vitejs/vite/issues/12001#issuecomment-1612411026
// no warning
Object.keys(mod).forEach(async (key) => {
    console.log(await mod[key](), mod2[key]);
});

// warning
Object.keys(mod2).forEach(async (key) => {
    console.log((await mod[key]()).default, mod2[key].default);
});
