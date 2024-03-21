# Использование

### Добавляет контрол в указанный родительский контейнер, устанавливая начальные значения available и selected.
```JavaScript
const arrangeBox = new ArrangeBox(container: HTMLElement, available: {id: string; name: string; node: HTMLElement});
```
Поле name используется для поиска.

### Уничтожает контрол
```JavaScript
arrangeBox.destroy()
```

### Сбрасывает контрол к значению, с которым он был инициализирован
```JavaScript
arrangeBox.reset()
```

### Выделяет элементы
```JavaScript
arrangeBox.focus(...ids: string[])
```

### Возвращает текущее состояние контрола
```JavaScript
arrangeBox.getState(): {available: string[], selected: string[]}
```

### Перемещает все элементы из указанного столбца в другой столбец
```JavaScript
arrangeBox.moveAll(from: 'available' | 'selected')
```

### Перемещает все выделенные элементы из столбца Available в столбец Selected
```JavaScript
arrangeBox.moveFocusedAvailableToSelected()
```

### Перемещает все выделенные элементы из столбца Selected в столбец Available
```JavaScript
arrangeBox.moveFocusedSelectedToAvailable()
```

### Сдвигает выделенные элементы из указанного столбца на один вверх.
```JavaScript
arrangeBox.moveFocusedUp(list: 'available' | 'selected')
```

### Сдвигает выделенные элементы из указанного столбца на один вниз.
```JavaScript
arrangeBox.moveFocusedDown(list: 'available' | 'selected')
```

### Сдвигает выделенные элементы в самый конец указанного столбца.
```JavaScript
arrangeBox.moveFocusedToTheBottom(list: 'available' | 'selected')
```

### Сдвигает выделенные элементы в самое начало указанного столбца.
```JavaScript
arrangeBox.moveFocusedToTheTop(list: 'available' | 'selected')
```
