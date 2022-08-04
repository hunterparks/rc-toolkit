// Recipe Importer
const textUrl = document.querySelector('#text-url');
const buttonUrlFetch = document.querySelector('#button-url-fetch');
const buttonUrlClear = document.querySelector('#button-url-clear');
const divUrlError = document.querySelector('#url-error');
const divUrlOutput = document.querySelector('#url-output');

const updateInnerText = (element, message) => {
  element.innerText = message;
};

const handleClear = () => {
  textUrl.value = '';
  updateInnerText(divUrlError, '');
  updateInnerText(divUrlOutput, '');
};
buttonUrlClear.addEventListener('click', handleClear);

const handleFetch = async () => {
  updateInnerText(divUrlError, '');
  const recipeUrl = textUrl.value;
  if (!/^https:\/\/[^ "]+$/.test(recipeUrl)) {
    updateInnerText(divUrlError, 'Invalid URL entered.');
    updateInnerText(divUrlOutput, '');
    return;
  }
  const res = await fetch(
    `https://api.codetabs.com/v1/proxy?quest=${recipeUrl}`
  );
  const data = await res.text();
  const shadowElement = document.createElement('html');
  shadowElement.innerHTML = data;
  const jsonLd = shadowElement.querySelector(
    'script[type="application/ld+json"]'
  );
  if (!jsonLd) {
    updateInnerText(divUrlError, 'Unable to find recipe data.');
    updateInnerText(divUrlOutput, '');
    return;
  }
  const info = JSON.parse(jsonLd.innerText);
  let recipe = info;
  if (Array.isArray(info)) {
    recipe = info.find((infum) => infum['@type'] === 'Recipe');
  }
  console.log(recipe);

  divUrlOutput.innerText += `IMAGE = ${recipe.image.url}\n\n`;
  divUrlOutput.innerText += `**Prep**: X mins | ** Total**: X mins | **Yield**: ${recipe.recipeYield}\n\n`;
  divUrlOutput.innerText += '## Ingredients\n';
  divUrlOutput.innerText += recipe.recipeIngredient
    .map((item) => `* ${item}`)
    .join('\n');
  divUrlOutput.innerText += '\n\n## Directions\n';
  divUrlOutput.innerText += recipe.recipeInstructions
    .map((item, idx) => `${idx + 1}. ${item.text}`)
    .join('\n');
  if (false) {
    // TODO: Check for notes
    divUrlOutput.innerText += '\n\n## Notes\n';
  }
  divUrlOutput.innerText += `\n*Source: ${recipe.mainEntityOfPage}*`;
};
buttonUrlFetch.addEventListener('click', handleFetch);
