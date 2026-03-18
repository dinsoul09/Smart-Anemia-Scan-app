### How to work every day with this project?

After final some feature (page, window, function or another) you need to push your changes to this repository

#### Steps
1. git status (проверяем статус измененных файлов, будут выведены все файлы, которые ты менял, создавал или удалял)
2. git add . (индексируем все файлы из git status, подготовка к commit)
3. git commit -m "your_message_with_feature" (example: 'feat: <your_message_with_feature>') (git commit -m "feat: SplashScreen")
4. git status (если мы делалил git add ., проиндексировали все файлы, то после ввода команды, все будет пусто)
5. git push -u origin main (используем только для НОВЫХ веток)
git push - загружаем данные в GitHub
-u origin - используем для первого пуша ветки
main - название ветки
6. git push (после первого пуша, далее можно использовать простой вариант)
7. git pull (получение изменений)
#### Additional
1. git checkout **-b** <название_ветки> (example: git checkout -b feature/SplashScreen) **(-b - это создание ветки)**
2. git checkout main -> git checkout <название_ветки> (как перемещаться между ветками)

#### More
1. git merge - слияние ветки
2. git rebase - перебазирование ветки
3. git restore - сброс коммита
4. git reset - сброс коммита
5. git cherry-pick - получение коммита

#### Обозначения
1. Commit (коммит) - это фиксированные изменения определенного этапа фичи.
2. Branch (ветка) - это последовательность коммитов, расположенная в последовательном временном порядке,
необходимая для работы с определенного логической цепочкой (можно менять).
