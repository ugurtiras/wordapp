import React from 'react';
import WordCard from './WordCard';

const WordList = ({ words, onDelete, onEdit }) => {
  if (words.length === 0) {
    return (
      <div className="empty-state">
        <h3>No words yet</h3>
        <p>Add your first word to get started!</p>
      </div>
    );
  }

  return (
    <div className="word-list">
      <h2>My Words ({words.length})</h2>
      <div className="word-grid">
        {words.map((word) => (
          <WordCard
            key={word._id}
            word={word}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default WordList;
