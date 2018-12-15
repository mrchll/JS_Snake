window.onload = function ()
{
  var canvasWidth = 1240;
  var canvasHeight = 560;
  var blockSize = 30;
  var ctx;
  var delay = 100;
  var xCoord = 0;
  var yCoord = 0;
  var dragonee;
  var golden;
  var widthInBlocks = canvasWidth / blockSize;
  var heightInBlocks = canvasHeight / blockSize;
  var score;
  var timeout;

  init();

  function init()
  {
    var canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.border = '10px solid #46331b';
    canvas.style.margin = 'auto';
    canvas.style.display = 'block';
    canvas.style.backgroundColor = 'rgba(90, 58, 0, 0.8)';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    dragonee = new Dragon([[6, 4], [5, 4], [4, 4]], 'right');
    golden = new Gold([10, 10]);
    score = 0;
    refreshCanvas();
  }

  function refreshCanvas()
  {
    dragonee.advance();

    if (dragonee.checkCollision())
    {
      gameOver();
    } else
    {
      if (dragonee.isEatingGold(golden))
      {
        score++;
        dragonee.ateGold = true;

        do
        {
          golden.setNewPosition();
        }
        while (golden.isOnDragon(dragonee));

        if (score % 5 == 0)
        {
            speedUp();
        }
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      drawScore();
      dragonee.draw();
      golden.draw();
      timeout = setTimeout(refreshCanvas, delay);
    }
  }

  function speedUp()
  {
      delay /= 2;
  }

  function gameOver()
  {
    ctx.save();
    ctx.font = 'bold 70px Cinzel';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    var centerX = canvasWidth / 2;
    var centerY = canvasHeight / 2;
    ctx.strokeText('Game Over', centerX, centerY - 180);
    ctx.fillText('Game Over', centerX, centerY - 180);
    ctx.font = 'bold 40px Cinzel';
    ctx.lineWidth = 1.5;
    ctx.strokeText('Tap Spacebar to Play Again', centerX, centerY - 120);
    ctx.fillText('Tap Spacebar to Play Again', centerX, centerY - 120);
    ctx.restore();
  }

  function restart()
  {
    dragonee = new Dragon([[6, 4], [5, 4], [4, 4]], 'right');
    golden = new Gold([10, 10]);
    score = 0;
    clearTimeout(timeout);
    delay = 100;
    refreshCanvas();
  }

  function drawScore()
  {
    ctx.save();
    ctx.font = 'bold 200px Cinzel';
    ctx.fillStyle = '#46331b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var centerX = canvasWidth / 2;
    var centerY = canvasHeight / 2;
    ctx.fillText(score.toString(), centerX, centerY);
    ctx.restore();
  }

  function drawBlock(ctx, position)
  {
    var x = position[0] * blockSize;
    var y = position[1] * blockSize;
    ctx.fillRect(x, y, blockSize, blockSize);
  }

  function Dragon(body, direction)
  {
    this.body = body;
    this.direction = direction;
    this.ateGold = false;
    this.draw = function ()
    {
      ctx.save();
      ctx.fillStyle = '#f58b00';
      for (var i = 0; i < this.body.length; i++)
      {
        drawBlock(ctx, this.body[i]);
      }

      ctx.restore();
    };

    this.advance = function ()
    {
      var nextPosition = this.body[0].slice();
      switch (this.direction)
      {
        case 'left':
          nextPosition[0] -= 1;
          break;
        case 'right':
          nextPosition[0] += 1;
          break;
        case 'down':
          nextPosition[1] += 1;
          break;
        case 'up':
          nextPosition[1] -= 1;
          break;
        default:
          throw('Invalid Direction');
      }
      this.body.unshift(nextPosition);

      if (!this.ateGold)
      {
        this.body.pop();
      } else
      {
        this.ateGold = false;
      }
    };

    this.setDirection = function (newDirection)
    {
      var allowedDirections;
      switch (this.direction)
      {
        case 'left':
        case 'right':
          allowedDirections = ['up', 'down'];
          break;
        case 'down':
        case 'up':
          allowedDirections = ['left', 'right'];
          break;
        default:
          throw('Invalid Direction');
      }

      if (allowedDirections.indexOf(newDirection) > -1)
      {
        this.direction = newDirection;
      }
    };

    this.checkCollision = function ()
    {
      var wallCollision = false;
      var dragonCollision = false;
      var head = this.body[0];
      var rest = this.body.slice(1); // reste du corps du serpent, sans inclure sa tête
      var dragonX = head[0];
      var dragonY = head[1];
      var minX = 0;
      var minY = 0;
      var maxX = widthInBlocks - 1;
      var maxY = heightInBlocks - 1;
      var isNotBetweenHorizontalWalls = dragonX < minX || dragonX > maxX;
      var isNotBetweenVerticalWalls = dragonY < minY || dragonY > maxY;

      if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
      {
        wallCollision = true;
      }

      for (var i = 0; i < rest.length; i++)
      {
        if (dragonX === rest[i][0] && dragonY === rest[i][1])
        {
          dragonCollision = true;
        }
      }

      return wallCollision || dragonCollision;
    };

    this.isEatingGold = function (goldToEat)
    {
      var head = this.body[0];

      if (head[0] === goldToEat.position[0] && head[1] === goldToEat.position[1])
      {
        return true;
      } else
      {
        return false;
      }
    };
  }

  function Gold(position)
  {
    this.position = position;
    this.draw = function ()
    {
      ctx.save();
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      var radius = blockSize / 2;
      var x = this.position[0] * blockSize + radius;
      var y = this.position[1] * blockSize + radius;
      ctx.arc(x, y, radius, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.restore();
    };

    this.setNewPosition = function ()
    {
      var newX = Math.round(Math.random() * (widthInBlocks - 1));
      var newY = Math.round(Math.random() * (heightInBlocks - 1));
      this.position = [newX, newY];
    };

    this.isOnDragon = function (dragonToCkeck)
    {
      var isOnDragon = false;

      for (var i = 0; i < dragonToCkeck.body.length; i++)
      {
        if (this.position[0] === dragonToCkeck.body[i][0] && this.position[1] === dragonToCkeck.body[i][1])
        {
          isOnDragon = true;
        }
      }

      return isOnDragon;
    };
  }

  document.onkeydown = function handleKeyDown(e)
  {
    var key = e.keyCode;
    var newDirection;
    switch (key)
    {
      case 37:
        newDirection = 'left';
        break;
      case 38:
        newDirection = 'up';
        break;
      case 39:
        newDirection = 'right';
        break;
      case 40:
        newDirection = 'down';
        break;
      case 32:
        restart();
        return;
      default:
        return;
    }
    dragonee.setDirection(newDirection);
  };
};
