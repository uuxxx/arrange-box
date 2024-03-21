import ArrangeBox from './ArrangeBox';
import testingItems from './testing-items';
import { getRandomNumber } from './utils';
import './style.css';

function toArrangeBoxElements(elements: typeof testingItems) {
  return elements.map((item) => {
    const $el = document.createElement('div');
    $el.classList.add('pick-list__item__flex-container');
    $el.innerHTML = /* HTML */ `
      <img class="pick-list__item__img" src=${item.img} alt="${item.name}" />

      <div class="pick-list__item__info">
        <div style="font-weight: 700">${item.name}</div>
        <div class="pick-list__item__add-info">
          <span style="font-size: 14px" class="material-symbols-outlined"
            >${item.categorieLabel}</span
          >
          <span>${item.categorie}</span>
        </div>
      </div>

      <div class="pick-list__item__price">$${item.price}</div>
    `;

    return { node: $el, id: item.id, name: item.name };
  });
}

function generateRandomArrangeBox() {
  let min = getRandomNumber(0, testingItems.length - 1);
  let max = getRandomNumber(0, testingItems.length - 1);

  if (min > max) {
    const temp = max;
    max = min;
    min = temp;
  }

  const selectedItems = toArrangeBoxElements(testingItems.slice(min, max));
  const availableItems = toArrangeBoxElements([
    ...testingItems.slice(0, min),
    ...testingItems.slice(max),
  ]);

  new ArrangeBox(
    document.getElementById('app')!,
    availableItems,
    selectedItems
  );
}

const arrangeBox = new ArrangeBox(
  document.getElementById('app')!,
  toArrangeBoxElements(testingItems)
);

const addRandomControl = document.getElementById('add-control')!;

addRandomControl.onclick = generateRandomArrangeBox;
