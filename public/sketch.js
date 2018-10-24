class Visualizer {
  constructor(X,Y,Width, Height, Title, Frequency) {
      this.Xpos = X;
      this.Ypos = Y;
      this.width = Width;
      this.height = Height;
      this.color = {r: 0, g: 0, b: 0, a: 65};

      this.Title = createElement('h6', Title);
      this.Title.position(this.Xpos, this.Ypos - 15);
      this.Title.style('color', 'rgb(20,20,20)');

      this.Frequency = Frequency;
  }

  setColor(r,g,b,a) {
    this.color = {r,g,b,a};
  }

  MouseInBounds() {
    return mouseX > this.Xpos && mouseX < this.Xpos + this.width && mouseY > this.Ypos && mouseY < this.Ypos + this.height;
  }

  draw(type, data) {
      fill(this.color.r, this.color.g, this.color.b, this.color.a);
      stroke(20, 20, 20, 255);

      strokeWeight(0.5);
      rect(this.Xpos, this.Ypos, this.width, this.height);

      if(type == 0)
      {
        strokeWeight(0.5);
        line(this.Xpos, this.Ypos + (this.height / 2), this.Xpos + this.width, this.Ypos + (this.height / 2));

        strokeWeight(0.5);
        noFill();
        beginShape();
  
        for (var i = 0; i < data.length; i++){
          var x = map(i, 0, data.length, this.Xpos, this.Xpos + this.width);
          var y = map(data[i], -1, 1, this.Ypos + this.height, this.Ypos);
          vertex(x, y);
        }
  
        endShape();
      } else if (type == 1) {

        strokeWeight(0.5);
        line(this.Xpos, this.Ypos + (this.height / 2) , this.Xpos + this.width, this.Ypos + (this.height / 2 ));

        strokeWeight(0.5);
        noFill();
        beginShape();
  
        for (var i = 0; i < data.length/2; i++){
          var x = map(i, 0, data.length/2, this.Xpos, this.Xpos + this.width);
          var y = map(data[i], 0, 255, this.Ypos + (this.height / 2), this.Ypos);
          vertex(x, y);
        }
  
        endShape();
      } else if (type == 2) {
        strokeWeight(0.5);
        line(this.Xpos, this.Ypos + (this.height / 2) , this.Xpos + this.width, this.Ypos + (this.height / 2 ));

        strokeWeight(0.5);
        noFill();
        beginShape();
  
        for (var i = 0; i < 100; i++){
          var ms = 5000;
          var amplitude = data.amp / 255;
          var x = i;
          var y = amplitude * cos(2 * PI * this.Frequency * (x / ms));
          x = map(x, 0, 100, this.Xpos, this.Xpos + this.width);
          y = map(y, -1, 1, this.Ypos + this.height, this.Ypos);

          vertex(x , y);
        }
  
        endShape();
      }
  }
}




// Sound manip
var fft;
var wave;
var sound;
var songActive = false;
var songLoaded = false;
var QueueSongOnStartup = false;

// Visualizers
var frequencyVisual;
var amplitudeVisual;
var enlargedVisual;
var separatedWaveVisuals;

// UI
var Title;
var AuthorName;
var Topic1;
var subComment1;
var MainColor;
var ContentBarColor;
var volumeSlider;
var musicPlayButton;
var volumeText;
var fftText;
var waveformText;

function setup() {
  // UI
  createCanvas(1080, 1200);
  MainColor = {r: 255, g: 255, b:255, a:255};
  ContentBarColor = {r: 255, g: 245, b:255, a:255};

  Title = createElement('h1', 'Audio Manipulation');
  Title.position(20, 20);

  AuthorName = createElement('h6', 'By: Eric Marquez');
  AuthorName.position(20, 60);

  Topic1 = createElement('h2', 'Separation of sound waves:');
  Topic1.position(20, 700);

  subComment1 = createElement('h6', 'Values are taken within a 0.2 ms interval.');
  subComment1.position(20, 735);

  musicPlayButton = createButton('Play Music');
  musicPlayButton.position(20, 100);
  musicPlayButton.mousePressed(togglePlayback);

  volumeText = createElement('h5', 'Volume:');
  volumeText.position(20, 140);
  volumeText.style('color', 'rgb(20,20,20)');

  volumeSlider = createSlider(0, 1, 0.1, 0.01);
  volumeSlider.position(120, 137);
  volumeSlider.style('color', 'rgb(0,200,0)');

  //Visualizers and Data manipulators
  fft = new p5.FFT();
  frequencyVisual = new Visualizer(20, 200, 200, 100, 'Frequency graph: 0-1024 hz');
  amplitudeVisual = new Visualizer(300, 200, 200, 100, 'Waveform graph: amp = -1, 1');
  enlargedVisual = new Visualizer(20, 360, 700, 280, 'Overview');

  separatedWaveVisuals = new Array();

  // Upper row
  separatedWaveVisuals.push(new Visualizer(20, 790, 200, 100, 'Waveform: 100hz', 100));
  separatedWaveVisuals.push(new Visualizer(240, 790, 200, 100, 'Waveform: 110hz', 110));
  separatedWaveVisuals.push(new Visualizer(460, 790, 200, 100, 'Waveform: 120hz', 120));

  // Lower row
  separatedWaveVisuals.push(new Visualizer(20, 920, 200, 100, 'Waveform: 130hz', 130));
  separatedWaveVisuals.push(new Visualizer(240, 920, 200, 100, 'Waveform: 140hz', 140));
  separatedWaveVisuals.push(new Visualizer(460, 920, 200, 100, 'Waveform: 150hz', 150));


  sound = loadSound('./sounds/sunflower.mp3', function(result, err) {
    songLoaded = true;
    // ContentBarColor.b -= 10;
    
    if(QueueSongOnStartup) {
      togglePlayback();
    }

  });
}

function draw() {
  if(!sound.isPlaying()){
    musicPlayButton.html('Play Music');
  }

  // put drawing code here
  background(MainColor.r, MainColor.g, MainColor.b, MainColor.a);
  sound.setVolume(volumeSlider.value());

  fill(ContentBarColor.r, ContentBarColor.g, ContentBarColor.b, ContentBarColor.a);
  stroke(20, 20, 20, 50);
  rect(10, 180, width - 100, 140);

  var wave = fft.waveform();
  var freq = fft.analyze()
  amplitudeVisual.draw(0, wave);
  frequencyVisual.draw(1, freq);
  
  stroke(20, 20, 20, 50);
  fill(ContentBarColor.r, ContentBarColor.g, ContentBarColor.b, ContentBarColor.a);
  if(amplitudeVisual.MouseInBounds()) {
    rect(10, 340, width - 100, 320);
    enlargedVisual.draw(0, wave);
  } else if ( frequencyVisual.MouseInBounds()) {
    rect(10, 340, width - 100, 320);
    enlargedVisual.draw(1, freq);
  } else {
    rect(10, 340, width - 100, 320);
    enlargedVisual.draw(1, new Array());
  }

  stroke(20, 20, 20, 50);
  fill(ContentBarColor.r, ContentBarColor.g, ContentBarColor.b, ContentBarColor.a);
  rect(10, 750, width - 100, 320);

  for(var i = 0; i < separatedWaveVisuals.length; i++) {
    var hz = separatedWaveVisuals[i].Frequency;
    separatedWaveVisuals[i].draw(2, {amp: freq[hz]});
  }

}

function togglePlayback() {
  if(songLoaded)
  {
    // Toggle Playback functions
    if(!sound.isPlaying())
    {
      if(!songActive) {
        songActive = true;
        QueueSongOnStartup = false;
      }
      musicPlayButton.html('Pause Music');
      sound.play();
    } else {
      musicPlayButton.html('Play Music');
      sound.pause();
    }
  } else{
    QueueSongOnStartup = true;
  }
}