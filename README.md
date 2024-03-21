# Использование

### Добавляет контрол в указанный родительский контейнер, устанавливая начальные значения available и selected.
```JavaScript
const arrangeBox = new ArrangeBox(container: HTMLElement, available: {id: string; name: string; node: HTMLElement});
```

Поле name используется для поиска.

Уничтожает контрол
arrangeBox.destroy()

Сбрасывает контрол к значению, с которым он был инициализирован
arrangeBox.reset()

Выделяет элементы
arrangeBox.focus(...ids: string[])

Возвращает текущее состояние контрола
arrangeBox.getState(): {available: string[], selected: string[]}

Перемещает все элементы из указанного столбца в другой столбец
arrangeBox.moveAll(from: 'available' | 'selected')

Перемещает все выделенные элементы из столбца Available в столбец Selected
arrangeBox.moveFocusedAvailableToSelected()

Перемещает все выделенные элементы из столбца Selected в столбец Available
arrangeBox.moveFocusedSelectedToAvailable()

Сдвигает выделенные элементы из указанного столбца на один вверх.
arrangeBox.moveFocusedUp(list: 'available' | 'selected')

Сдвигает выделенные элементы из указанного столбца на один вниз.
arrangeBox.moveFocusedDown(list: 'available' | 'selected')

Сдвигает выделенные элементы в самый конец указанного столбца.
arrangeBox.moveFocusedToTheBottom(list: 'available' | 'selected')

Сдвигает выделенные элементы в самое начало указанного столбца.
arrangeBox.moveFocusedToTheTop(list: 'available' | 'selected')
