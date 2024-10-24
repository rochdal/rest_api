// === Сервер для работы с пользователями === //

//==================================================================

//=== Установить библиотеку express : npm install express

// Express — это популярный веб - фреймворк для Node.js, написанный на 
// JavaScript.Он предоставляет мощный набор функций для создания 
// веб - приложений  и API, что делает его одним из самых распространенных
// инструментов для разработки серверной части приложений.

//=== Создать экземпляр express
const express = require('express');

//==================================================================

//=== Установить библиотеку fs : npm install fs

// Библиотека fs (файловая система) в Node.js предоставляет API для работы
// с файловой системой. Она позволяет выполнять операции чтения, записи, удаления
// и управления файлами и директориями.
// Основные функции библиотеки fs:
// Чтение файлов: Вы можете читать содержимое файлов как синхронно, так и асинхронно.
// Например, fs.readFile() позволяет асинхронно читать файл, а fs.readFileSync() — синхронно.
// Запись файлов: С помощью fs.writeFile() и fs.writeFileSync() можно записывать данные
// в файлы. Если файл не существует, он будет создан.
// Удаление файлов: Функция fs.unlink() позволяет удалять файлы, а fs.rmdir() — директории.
// Работа с директориями: Библиотека предоставляет функции для создания, чтения
// и удаления директорий, такие как fs.mkdir() и fs.readdir().
// Потоковая работа с файлами: fs.createReadStream() и fs.createWriteStream() позволяют
// работать с файлами в потоковом режиме, что полезно для обработки больших файлов.

//=== Создать экземпляр fs
const fs = require('fs');

//==================================================================

//=== Установить библиотеку path : npm install path

// Библиотека path в Node.js предоставляет утилиты для работы с путями к файлам и директориям.
// Она помогает создавать, нормализовать и анализировать пути, что особенно полезно при разработке
// кросс-платформенных приложений.
// Основные функции библиотеки path:
// path.join(): Объединяет несколько сегментов пути в один, автоматически добавляя 
// разделители между ними, что позволяет избежать ошибок при формировании путей.
// path.resolve(): Преобразует последовательность путей в абсолютный путь, основываясь 
// на текущем рабочем каталоге.
// path.normalize(): Нормализует путь, устраняя лишние разделители и точки, что делает
// его более читаемым и корректным.
// path.basename(): Возвращает последний сегмент пути, что полезно для получения имени файла.
// path.dirname(): Возвращает путь к директории, содержащей файл, что позволяет легко 
// извлекать информацию о расположении файла.
// path.extname(): Возвращает расширение файла, что может быть полезно для обработки файлов по типу.


//=== Создать экземпляр path
const path = require('path');

//=== Создать экземпляр приложения express

// Создание экземпляра приложения: Эта строка создает новый экземпляр
// приложения Express и присваивает его переменной app. Это приложение
// будет использоваться для настройки маршрутов, обработки запросов и управления
// middleware.

const app = express();

//=== Функция для чтения данных из userdata.json
const UserData = () => {
    const filePath = path.join(__dirname, 'usersdata.json'); // Путь к файлу
    try {
        const data = fs.readFileSync(filePath, 'utf8'); // Чтение файла
        return JSON.parse(data); // Парсинг JSON
    } catch (error) {
        console.error('Ошибка при чтении или парсинге файла:', error);
        return { Users: [], CurrMaxID: 0 }; // Возвращаем пустые данные в случае ошибки
    }
};

//--- Получить данные из файла userdata.json
const DataUsers = UserData();

//--- Массив данных о пользователях
const Users = DataUsers.Users;

//--- Текущий максимальный идентификатор пользователя
let UserID = DataUsers.CurrMaxID;


//=== Подключить middleware

// Парсинг JSON: Когда клиент отправляет запрос с данными в формате JSON, это
// middleware преобразует эти данные в объект JavaScript, доступный через req.body
// в обработчиках маршрутов.

app.use(express.json());


//=== Обработчик запроса GET для получения списка всех пользователей

app.get('/users', (req, res) => {
    res.send({ Users });
});

//=== Обработчик запроса GET для пользователя по его id

//--- Определяем маршрут для обработки GET-запросов по адресу '/users/:id', где :id — это параметр URL
app.get('/users/:id', (req, res) => {
    //--- Ищем пользователя в массиве UsersData по id, который передан в параметрах запроса
    const user = Users.find((user) => user.id === Number(req.params.id));

    //--- Проверяем, найден ли пользователь
    if (user) {
        //--- Если пользователь найден, отправляем его данные в ответе
        res.send({ user });
    } else {
        //-- Если пользователь не найден, устанавливаем статус ответа 404 (Не найден)
        res.status(404);
        //--- Отправляем ответ с null для пользователя
        res.send({ user: null });
    }
});

//=== Обработчик запроса POST для создания пользователя

app.post('/users', (req, res) => {

    //--- Увеличить значение уникального идентификатора ползователя
    UserID += 1;

    console.log(UserID);

    //--- Добавить пользователя
    Users.push({
        id: UserID,
        ...req.body
    });

    //--- Записать данные о пользователях в файл usersdata.json

    // Формируем объект для записи
    const dataToWrite = {
        CurrMaxID: UserID,
        Users: Users
    };

    // Путь к файлу
    const filePath = path.join(__dirname, 'usersdata.json');

    // Записываем данные в файл
    fs.writeFileSync(filePath, JSON.stringify(dataToWrite, null, 4), 'utf8');

    console.log('Данные успешно записаны в файл usersdata.json');


    res.send({ id: UserID });
});

//=== Обработчик запроса PUT для измененияы пользователя

app.put('/users/:id', (req, res) => {

    const user = Users.find((user) => user.id === Number(req.params.id));

    if (user) {

        user.FirstName = req.body.FirstName;
        user.SecondName = req.body.SecondName;
        user.Age = req.body.Age;
        user.City = req.body.City;

        //--- Записать данные о пользователях в файл usersdata.json

        // Формируем объект для записи
        const dataToWrite = {
            CurrMaxID: UserID,
            Users: Users
        };

        // Путь к файлу
        const filePath = path.join(__dirname, 'usersdata.json');

        // Записываем данные в файл
        fs.writeFileSync(filePath, JSON.stringify(dataToWrite, null, 4), 'utf8');

        console.log('Данные успешно записаны в файл usersdata.json');

        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    }
});

//=== Обработчик запроса DELETE для измененияы пользователя

app.delete('/users/:id', (req, res) => {
    const user = Users.find((user) => user.id === Number(req.params.id));

    if (user) {
        const userIndex = Users.indexOf(user);
        Users.splice(userIndex, 1);

        //--- Записать данные о пользователях в файл usersdata.json

        // Формируем объект для записи
        const dataToWrite = {
            CurrMaxID: UserID,
            Users: Users
        };

        // Путь к файлу
        const filePath = path.join(__dirname, 'usersdata.json');

        // Записываем данные в файл
        fs.writeFileSync(filePath, JSON.stringify(dataToWrite, null, 4), 'utf8');

        console.log('Данные успешно записаны в файл usersdata.json');


        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    }
});

//=== Обработчик несуществующих роутов (запросов)
app.use((req, res) => {
    res.status(404).send({ message: 'URL not found' });
});


//=== Запуск Http сервера на порту 3000
console.log('Сервер запущен на порту 3000');
app.listen(3000);

