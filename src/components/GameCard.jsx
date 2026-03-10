import '../styles/GameCard.css';

export default function GameCard({ card, onClick, isFlipped, isMatched }) {
  return (
    <div
      className={`game-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
      onClick={onClick}
    >
      <div className="card-inner">
        <div className="card-front">?</div>
        <div className="card-back">{card.emoji}</div>
      </div>
    </div>
  );
}
