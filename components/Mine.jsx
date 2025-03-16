const mineImages = {
  coal: '/images/mines/coal.png',
  iron: '/images/mines/iron.png',
  gold: '/images/mines/gold.png',
  diamond: '/images/mines/diamond.png',
};

function Mine({ type }) {
  return (
    <div className="mine-container">
      <img 
        src={mineImages[type]} 
        alt={`${type} mine`}
        className="mine-image"
      />
    </div>
  );
}

export default Mine; 