import Sortable from "sortablejs";
import { ArrangeBoxElement } from "./ArrangeBoxElement";
import { InputItem, ControlButton } from "./types";
import { debounce } from "../utils";

export class ArrangeBox {
  private uid = `_${crypto.randomUUID()}`;

  private controlAvailableButtons: ControlButton[] = [
    {
      id: "available-up",
      listener: () => this.moveFocusedUp("available"),
      icon: "keyboard_arrow_up",
    },
    {
      id: "available-up-to-top",
      listener: () => this.moveFocusedToTheTop("available"),
      icon: "keyboard_double_arrow_up",
    },
    {
      id: "available-down",
      listener: () => this.moveFocusedDown("available"),
      icon: "keyboard_arrow_down",
    },
    {
      id: "available-down-to-bottom",
      listener: () => this.moveFocusedToTheBottom("available"),
      icon: "keyboard_double_arrow_down",
    },
  ];
  private controlMovingBetweenListsButtons: ControlButton[] = [
    {
      id: "focused-from-available-to-selected",
      listener: () => this.moveFocusedSelectedToAvailable(),
      icon: "keyboard_arrow_left",
    },
    {
      id: "all-from-available-to-selected",
      listener: () => this.moveAll("selected"),
      icon: "keyboard_double_arrow_left",
    },
    {
      id: "focused-from-selected-to-available",
      listener: () => this.moveFocusedAvailableToSelected(),
      icon: "keyboard_arrow_right",
    },
    {
      id: "all-from-selected-to-available",
      listener: () => this.moveAll("available"),
      icon: "keyboard_double_arrow_right",
    },
  ];
  private controlSelectedButtons: ControlButton[] = [
    {
      id: "selected-up",
      listener: () => this.moveFocusedUp("selected"),
      icon: "keyboard_arrow_up",
    },
    {
      id: "selected-up-to-top",
      listener: () => this.moveFocusedToTheTop("selected"),
      icon: "keyboard_double_arrow_up",
    },
    {
      id: "selected-down",
      listener: () => this.moveFocusedDown("selected"),
      icon: "keyboard_arrow_down",
    },
    {
      id: "selected-down-to-bottom",
      listener: () => this.moveFocusedToTheBottom("selected"),
      icon: "keyboard_double_arrow_down",
    },
  ];
  private otherControlButtons: ControlButton[] = [
    { id: "reset", listener: () => this.reset(), text: "reset" },
    {
      id: "log state",
      listener: () => console.log(this.getState()),
      text: "log state",
    },
    { id: "destroy", listener: () => this.destroy(), text: "destroy" },
  ];

  private arrangeBoxElementsMap: { [x: InputItem["id"]]: ArrangeBoxElement } =
    {};

  private initialState: {
    available: InputItem["id"][];
    selected: InputItem["id"][];
  } = { available: [], selected: [] };

  private availableIds: InputItem["id"][];
  private selectedIds: InputItem["id"][];
  private readonly focusedAvailableIds = new Set<InputItem["id"]>();
  private readonly focusedSelectedIds = new Set<InputItem["id"]>();

  private $arrangeBoxContainer!: HTMLElement;
  private $availableItemsContainer!: HTMLElement;
  private $selectedItemsContainer!: HTMLElement;
  private $selectedInput!: HTMLElement;
  private $availableInput!: HTMLElement;

  private willBeCalledOnDestroy: (() => void)[] = [];

  constructor(
    private $rootEl: HTMLElement,
    availableElements: InputItem[] = [],
    selectedElements: InputItem[] = []
  ) {
    this.availableIds = availableElements.map((el) => {
      if (el.id in this.arrangeBoxElementsMap) {
        throw new Error("all ids must be unique!");
      }
      this.arrangeBoxElementsMap[el.id] = new ArrangeBoxElement(el);
      return el.id;
    });

    this.selectedIds = selectedElements.map((el) => {
      if (el.id in this.arrangeBoxElementsMap) {
        throw new Error("all ids must be unique!");
      }
      this.arrangeBoxElementsMap[el.id] = new ArrangeBoxElement(el);
      return el.id;
    });

    this.initialState.available = [...this.availableIds];
    this.initialState.selected = [...this.selectedIds];

    this.onAvailableClick = this.onAvailableClick.bind(this);
    this.onSelectedClick = this.onSelectedClick.bind(this);
    this.moveAll = this.moveAll.bind(this);
    this.moveFocusedAvailableToSelected =
      this.moveFocusedAvailableToSelected.bind(this);
    this.moveFocusedSelectedToAvailable =
      this.moveFocusedSelectedToAvailable.bind(this);
    this.moveFocusedToTheTop = this.moveFocusedToTheTop.bind(this);
    this.moveFocusedToTheBottom = this.moveFocusedToTheBottom.bind(this);
    this.moveFocusedUp = this.moveFocusedUp.bind(this);
    this.moveFocusedDown = this.moveFocusedDown.bind(this);
    this.onSelectedInput = this.onSelectedInput.bind(this);
    this.onAvailableInput = this.onAvailableInput.bind(this);
    this.onSearch = debounce.call(this, this.onSearch, 300);

    this.render();
  }

  public destroy() {
    this.willBeCalledOnDestroy.forEach((cb) => cb());
    this.$rootEl.removeChild(this.$arrangeBoxContainer);
  }

  public getState() {
    return {
      available: this.availableIds,
      selected: this.selectedIds,
    };
  }

  public reset() {
    this.selectedIds = this.initialState.selected;
    this.availableIds = this.initialState.available;
    this.focusedAvailableIds.clear();
    this.focusedSelectedIds.clear();

    this.$availableItemsContainer.innerHTML = "";
    this.$selectedItemsContainer.innerHTML = "";

    this.selectedIds.forEach((id) => {
      const arrangeBox = this.arrangeBoxElementsMap[id];
      arrangeBox.append(this.$selectedItemsContainer);
    });

    this.availableIds.forEach((id) => {
      const arrangeBox = this.arrangeBoxElementsMap[id];
      arrangeBox.append(this.$availableItemsContainer);
    });
  }

  public focus(...ids: InputItem["id"][]) {
    const selectedIds = new Set(this.selectedIds);

    for (const targetId of ids) {
      if (!(targetId in this.arrangeBoxElementsMap)) {
        throw new Error(`Element with id: ${targetId} doesn't exist`);
      }

      const arrangeBox = this.arrangeBoxElementsMap[targetId];

      if (selectedIds.has(targetId)) {
        this.focusedSelectedIds.add(targetId);
      } else {
        this.focusedAvailableIds.add(targetId);
      }

      if (!arrangeBox.focused) {
        arrangeBox.focus();
      }
    }
  }

  private render() {
    const $arrangeBoxContainer = document.createElement("div");
    this.$arrangeBoxContainer = $arrangeBoxContainer;
    $arrangeBoxContainer.classList.add("arrange-box");
    $arrangeBoxContainer.innerHTML = /* HTML */ `
      <div id="other-btns"></div>
      <div class="arrange-box-main">
        <div id="available-btns" class="pick-list-buttons"></div>
        <div class="pick-list">
          <div class="pick-list__header">Available</div>
          <div class="pick-list__filter-container">
            <div class="pick-list__filter">
              <input
                id="${this.uid}-available-filter-input"
                type="text"
                placeholder="Search by name"
              />
              <span class="material-symbols-outlined pick-list__search-icon">
                search
              </span>
            </div>
          </div>

          <ul id="available-items" class="pick-list__items"></ul>
        </div>

        <div id="move-between-lists-btns" class="pick-list-buttons"></div>

        <div class="pick-list">
          <div class="pick-list__header">Selected</div>
          <div class="pick-list__filter-container">
            <div class="pick-list__filter">
              <input
                id="${this.uid}-selected-filter-input"
                type="text"
                placeholder="Search by name"
              />
              <span class="material-symbols-outlined pick-list__search-icon">
                search
              </span>
            </div>
          </div>
          <ul id="selected-items" class="pick-list__items"></ul>
        </div>

        <div id="selected-btns" class="pick-list-buttons"></div>
      </div>
    `;

    this.$availableItemsContainer =
      $arrangeBoxContainer.querySelector("#available-items")!;
    this.$selectedItemsContainer =
      $arrangeBoxContainer.querySelector("#selected-items")!;

    this.$availableInput = $arrangeBoxContainer.querySelector(
      `#${this.uid}-available-filter-input`
    )!;

    this.$selectedInput = $arrangeBoxContainer.querySelector(
      `#${this.uid}-selected-filter-input`
    )!;

    this.availableIds.forEach((id) => {
      const el = this.arrangeBoxElementsMap[id];
      el.append(this.$availableItemsContainer);
    });

    this.selectedIds.forEach((id) => {
      const el = this.arrangeBoxElementsMap[id];
      el.append(this.$selectedItemsContainer);
    });

    this.attachEventListeners();

    this.renderControlButtons(
      $arrangeBoxContainer.querySelector("#other-btns")!,
      this.otherControlButtons
    );

    this.renderControlButtons(
      $arrangeBoxContainer.querySelector("#available-btns")!,
      this.controlAvailableButtons
    );

    this.renderControlButtons(
      $arrangeBoxContainer.querySelector("#move-between-lists-btns")!,
      this.controlMovingBetweenListsButtons
    );

    this.renderControlButtons(
      $arrangeBoxContainer.querySelector("#selected-btns")!,
      this.controlSelectedButtons
    );

    this.$rootEl.appendChild($arrangeBoxContainer);
    const dragAndDropTeardown = this.setDragAndDrop();
    this.willBeCalledOnDestroy.push(dragAndDropTeardown);
  }

  private renderControlButtons(
    $container: HTMLElement,
    buttons: ControlButton[]
  ) {
    buttons.forEach(({ id, listener, icon, text }) => {
      const $button = document.createElement("button");
      $button.id = id;
      if (icon) {
        $button.insertAdjacentHTML(
          "beforeend",
          `<span class="material-symbols-outlined"> ${icon} </span>`
        );
      }
      if (text) {
        $button.insertAdjacentHTML("beforeend", `<span>${text}</span>`);
      }

      $button.addEventListener("click", listener);
      this.willBeCalledOnDestroy.push(() => {
        $button.removeEventListener("click", listener);
      });
      $container.appendChild($button);
    });
  }

  private attachEventListeners() {
    this.$availableItemsContainer.addEventListener(
      "click",
      this.onAvailableClick
    );

    this.willBeCalledOnDestroy.push(() => {
      this.$availableItemsContainer.removeEventListener(
        "click",
        this.onAvailableClick
      );
    });

    this.$selectedItemsContainer.addEventListener(
      "click",
      this.onSelectedClick
    );

    this.willBeCalledOnDestroy.push(() => {
      this.$selectedItemsContainer.removeEventListener(
        "click",
        this.onSelectedClick
      );
    });

    this.$availableInput.addEventListener("input", this.onAvailableInput);
    this.willBeCalledOnDestroy.push(() => {
      this.$availableInput.removeEventListener("input", this.onAvailableInput);
    });

    this.$selectedInput.addEventListener("input", this.onSelectedInput);
    this.willBeCalledOnDestroy.push(() => {
      this.$selectedInput.removeEventListener("input", this.onSelectedInput);
    });
  }

  // focus events
  private onAvailableClick(e: MouseEvent) {
    if (e.target === this.$availableItemsContainer) return;
    const targetId = this.findArrangeBoxElementId(e.target as HTMLElement);

    const targetArrangeBoxElement = this.arrangeBoxElementsMap[targetId];

    if (targetArrangeBoxElement.focused) {
      targetArrangeBoxElement.unfocus();
      this.focusedAvailableIds.delete(targetId);
    } else {
      targetArrangeBoxElement.focus();
      this.focusedAvailableIds.add(targetId);
    }
  }

  private onSelectedClick(e: MouseEvent) {
    if (e.target === this.$selectedItemsContainer) return;
    const targetId = this.findArrangeBoxElementId(e.target as HTMLElement);

    const targetArrangeBoxElement = this.arrangeBoxElementsMap[targetId];

    if (targetArrangeBoxElement.focused) {
      targetArrangeBoxElement.unfocus();
      this.focusedSelectedIds.delete(targetId);
    } else {
      targetArrangeBoxElement.focus();
      this.focusedSelectedIds.add(targetId);
    }
  }

  private findArrangeBoxElementId($el: HTMLElement) {
    let curNode = $el;

    while (!curNode.dataset.id) {
      curNode = curNode.parentElement!;
    }

    return curNode.dataset.id;
  }

  // moving
  private setDragAndDrop() {
    const sortableAvailable = new Sortable(this.$availableItemsContainer, {
      group: this.uid,
      animation: 150,
      delay: 100,
      delayOnTouchOnly: true,
      store: {
        get: () => {
          return this.availableIds;
        },
        set: (sortable) => {
          this.availableIds = sortable.toArray();

          for (const id of this.availableIds) {
            const arrangeBox = this.arrangeBoxElementsMap[id];
            if (arrangeBox.focused && !this.focusedAvailableIds.has(id)) {
              this.focusedAvailableIds.add(id);
              this.focusedSelectedIds.delete(id);
            }
          }
        },
      },
    });

    const sortableSelected = new Sortable(this.$selectedItemsContainer, {
      group: this.uid,
      animation: 150,
      delay: 100,
      delayOnTouchOnly: true,
      store: {
        get: () => {
          return this.selectedIds;
        },
        set: (sortable) => {
          this.selectedIds = sortable.toArray();

          for (const id of this.selectedIds) {
            const arrangeBox = this.arrangeBoxElementsMap[id];
            if (arrangeBox.focused && !this.focusedSelectedIds.has(id)) {
              this.focusedSelectedIds.add(id);
              this.focusedAvailableIds.delete(id);
            }
          }
        },
      },
    });

    return () => {
      sortableAvailable.destroy(), sortableSelected.destroy();
    };
  }

  private getListInfo(list: "available" | "selected") {
    let $container: HTMLElement;
    let ids: InputItem["id"][];
    let focusedIds: Set<InputItem["id"]>;

    if (list === "available") {
      $container = this.$availableItemsContainer;
      ids = this.availableIds;
      focusedIds = this.focusedAvailableIds;
    } else {
      $container = this.$selectedItemsContainer;
      ids = this.selectedIds;
      focusedIds = this.focusedSelectedIds;
    }

    return {
      $container,
      ids,
      focusedIds,
    };
  }

  public moveAll(from: "available" | "selected") {
    let $from: HTMLElement;
    let fromIds: InputItem["id"][];
    let fromFocusedIds: Set<InputItem["id"]>;
    let $to: HTMLElement;
    let toIds: InputItem["id"][];
    let toFocusedIds: Set<InputItem["id"]>;

    if (from === "available") {
      $from = this.$availableItemsContainer;
      fromIds = this.availableIds;
      fromFocusedIds = this.focusedAvailableIds;
      $to = this.$selectedItemsContainer;
      toIds = this.selectedIds;
      toFocusedIds = this.focusedSelectedIds;
    } else {
      $from = this.$selectedItemsContainer;
      fromIds = this.selectedIds;
      fromFocusedIds = this.focusedSelectedIds;
      $to = this.$availableItemsContainer;
      toIds = this.availableIds;
      toFocusedIds = this.focusedAvailableIds;
    }
    $from.innerHTML = "";
    fromIds.forEach((id) => {
      toIds.push(id);
      this.arrangeBoxElementsMap[id].append($to);
    });

    if (from === "available") {
      this.availableIds = [];
    } else {
      this.selectedIds = [];
    }

    fromFocusedIds.forEach((id) => {
      fromFocusedIds.delete(id);
      toFocusedIds.add(id);
    });
  }

  public moveFocusedAvailableToSelected() {
    this.availableIds = this.availableIds.filter(
      (id) => !this.focusedAvailableIds.has(id)
    );

    this.focusedAvailableIds.forEach((targetId) => {
      const targetArrangeBox = this.arrangeBoxElementsMap[targetId];
      targetArrangeBox.remove(this.$availableItemsContainer);
      targetArrangeBox.append(this.$selectedItemsContainer);

      this.selectedIds.push(targetId);
      this.focusedSelectedIds.add(targetId);
      this.focusedAvailableIds.delete(targetId);
    });
  }

  public moveFocusedSelectedToAvailable() {
    this.selectedIds = this.selectedIds.filter(
      (id) => !this.focusedSelectedIds.has(id)
    );

    this.focusedSelectedIds.forEach((targetId) => {
      const targetArrangeBox = this.arrangeBoxElementsMap[targetId];
      targetArrangeBox.remove(this.$selectedItemsContainer);
      targetArrangeBox.append(this.$availableItemsContainer);

      this.availableIds.push(targetId);
      this.focusedAvailableIds.add(targetId);
      this.focusedSelectedIds.delete(targetId);
    });
  }

  public moveFocusedToTheTop(list: "available" | "selected") {
    const { $container, ids, focusedIds } = this.getListInfo(list);

    const selected: InputItem["id"][] = [];
    const notSelected: InputItem["id"][] = [];

    for (const id of ids) {
      if (focusedIds.has(id)) {
        selected.push(id);
      } else {
        notSelected.push(id);
      }
    }

    if (list === "selected") {
      this.selectedIds = [...selected, ...notSelected];
    } else {
      this.availableIds = [...selected, ...notSelected];
    }

    for (let i = ids.length - 1; i >= 0; i--) {
      const id = ids[i];

      if (focusedIds.has(id)) {
        const arrangeBox = this.arrangeBoxElementsMap[id];
        arrangeBox.remove($container);
        arrangeBox.prepend($container);
      }
    }

    $container.scroll({ top: 0 });
  }

  public moveFocusedToTheBottom(list: "available" | "selected") {
    const { $container, ids, focusedIds } = this.getListInfo(list);

    const selected: InputItem["id"][] = [];
    const notSelected: InputItem["id"][] = [];

    for (const id of ids) {
      if (focusedIds.has(id)) {
        selected.push(id);
      } else {
        notSelected.push(id);
      }
    }

    if (list === "selected") {
      this.selectedIds = [...notSelected, ...selected];
    } else {
      this.availableIds = [...notSelected, ...selected];
    }

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];

      if (focusedIds.has(id)) {
        const arrangeBox = this.arrangeBoxElementsMap[id];
        arrangeBox.remove($container);
        arrangeBox.append($container);
      }
    }

    $container.scroll({ top: $container.scrollHeight });
  }

  public moveFocusedUp(list: "available" | "selected") {
    const { $container, ids, focusedIds } = this.getListInfo(list);

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (focusedIds.has(id)) {
        if (i === 0) break;

        const arrangeBox = this.arrangeBoxElementsMap[id];

        const temp = ids[i - 1];
        const referenceElement = this.arrangeBoxElementsMap[temp].node;
        $container.insertBefore(arrangeBox.node, referenceElement);

        const { offsetTop } = arrangeBox.node;
        const delta = $container.scrollTop - offsetTop;

        if (delta > 0) {
          $container.scrollBy({ top: -delta });
        }

        ids[i - 1] = id;
        ids[i] = temp;
      }
    }
  }

  public moveFocusedDown(list: "available" | "selected") {
    const { $container, ids, focusedIds } = this.getListInfo(list);

    for (let i = ids.length - 1; i >= 0; i--) {
      const id = ids[i];
      if (focusedIds.has(id)) {
        if (i === ids.length - 1) break;

        const arrangeBox = this.arrangeBoxElementsMap[id];

        const temp = ids[i + 1];
        const referenceElement = this.arrangeBoxElementsMap[temp].node;
        $container.insertBefore(referenceElement, arrangeBox.node);

        const { offsetTop, offsetHeight } = arrangeBox.node;

        const delta =
          offsetTop +
          offsetHeight -
          ($container.scrollTop + $container.offsetHeight);

        if (delta > 0) {
          $container.scrollBy({
            top: delta,
          });
        }

        ids[i + 1] = id;
        ids[i] = temp;
      }
    }
  }

  // search
  private onSearch(e: Event, filterList: "available" | "selected") {
    const query = (e.target as HTMLInputElement).value.toLocaleLowerCase();
    const ids =
      filterList === "available" ? this.availableIds : this.selectedIds;

    for (const id of ids) {
      const arrangeBox = this.arrangeBoxElementsMap[id];
      if (arrangeBox.name.toLocaleLowerCase().includes(query)) {
        arrangeBox.show();
      } else {
        arrangeBox.hide();
      }
    }
  }

  private onSelectedInput(e: Event) {
    this.onSearch(e, "selected");
  }

  private onAvailableInput(e: Event) {
    this.onSearch(e, "available");
  }
}
