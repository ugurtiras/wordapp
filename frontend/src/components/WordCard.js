import React from 'react';

const WordCard = ({ word, onDelete, onEdit }) => {
  return (
    <div className="word-card">
      <div className="word-header">
        <h3>{word.word}</h3>
        <span className={`level-badge level-${word.level}`}>{word.level}</span>
      </div>
      <p className="meaning">{word.meaning}</p>
      {word.example && (
        <p className="example">
          <em>"{word.example}"</em>
        </p>
      )}
      <div className="word-actions">
        <button onClick={() => onEdit(word)} className="btn-edit">
          Edit
        </button>
        <button onClick={() => onDelete(word._id)} className="btn-delete">
          Delete
        </button>
      </div>
    </div>
  );
};

export default WordCard;
