import React, { useState } from 'react';
import "./SearchForm.css"; // Подключаем отдельный CSS файл

const SearchForm = ({ onSearchHandler }) => {
  // Состояние для хранения значения поиска
  const [searchValue, setSearchValue] = useState("");

  // Обработка отправки формы
  function handleSubmit(e) {
    e.preventDefault();
    // Вызов функции поиска, переданной из родителя, с обрезанным значением
    onSearchHandler(searchValue.trim());
  }

  return (
    // Форма поиска
    <form className="search-form" onSubmit={handleSubmit}>
      {/* Поле ввода поиска */}
      <input
        type="text"
        className="search-input"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search categories or cards..."
      />
      {/* Кнопка поиска */}
      <button className="button-search" type="submit">Search</button>
    </form>
  );
};

export default SearchForm;
