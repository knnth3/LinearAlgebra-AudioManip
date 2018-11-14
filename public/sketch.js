class Visualizer {
  constructor(X, Y, Width, Height, Title, Frequency, bShouldPlaySound = false) {
    this.Xpos = X;
    this.Ypos = Y;
    this.width = Width;
    this.height = Height;
    this.playing = false;
    this.color = { r: 0, g: 0, b: 0, a: 65 };
    this.amp = 1.0;
    this.volume = 0.1;

    this.Title = createElement('h6', Title);
    this.Title.position(this.Xpos, this.Ypos - 15);
    this.Title.style('color', 'rgb(20,20,20)');

    this.Frequency = Frequency;

    if (bShouldPlaySound) {
      this.showPlayButton();
    }
  }

  setAmplitude(amp) {
    this.amp = amp;
    this.AmplitudeText = createElement('h6', 'Amp: ' + this.amp.toFixed(4));
    this.AmplitudeText.position(this.Xpos + 60, this.Ypos + 100);
  }

  setVolume(vol) {
    this.volume = vol;

    if (this.playing) {
      this.osc.amp(this.volume * this.amp, 0.1);
    } else {
      this.osc.amp(0, 0.1);
    }
  }

  showPlayButton() {
    this.playButton = createButton('Play');
    this.playButton.position(this.Xpos, this.Ypos);
    this.playButton.mousePressed(() => {
      if (!this.playing) {
        this.playing = true;
        this.playButton.html('Pause');
        if (!this.osc.started) {
          this.osc.start();
        }

      } else {
        this.volume = 0;
        this.playing = false;
        this.playButton.html('Play');
      }
    });

    this.osc = new p5.Oscillator();
    this.osc.setType('sine');
    this.osc.freq(this.Frequency);
    this.osc.amp(0);
  }

  setColor(r, g, b, a) {
    this.color = { r, g, b, a };
  }

  MouseInBounds() {
    var inBounds = mouseX > this.Xpos && mouseX < this.Xpos + this.width && mouseY > this.Ypos && mouseY < this.Ypos + this.height;
    return inBounds;
  }

  draw(type, data) {
    fill(this.color.r, this.color.g, this.color.b, this.color.a);
    stroke(20, 20, 20, 255);

    strokeWeight(0.5);
    rect(this.Xpos, this.Ypos, this.width, this.height);

    if (type == 0) {
      strokeWeight(0.5);
      line(this.Xpos, this.Ypos + (this.height / 2), this.Xpos + this.width, this.Ypos + (this.height / 2));

      strokeWeight(0.5);
      noFill();
      beginShape();

      for (var i = 0; i < data.length; i++) {
        var x = map(i, 0, data.length, this.Xpos, this.Xpos + this.width);
        var y = map(data[i], -1, 1, this.Ypos + this.height, this.Ypos);
        vertex(x, y);
      }

      endShape();
    } else if (type == 1) {

      strokeWeight(0.5);
      line(this.Xpos, this.Ypos + (this.height / 2), this.Xpos + this.width, this.Ypos + (this.height / 2));

      strokeWeight(0.5);
      noFill();
      beginShape();

      for (var i = 0; i < data.length; i++) {
        var x = map(i, 0, data.length, this.Xpos, this.Xpos + this.width);
        var y = map(data[i], 0, 255, this.Ypos + (this.height / 2), this.Ypos);
        vertex(x, y);
      }

      endShape();
    } else if (type == 2) {
      strokeWeight(0.5);
      line(this.Xpos, this.Ypos + (this.height / 2), this.Xpos + this.width, this.Ypos + (this.height / 2));

      strokeWeight(0.5);
      noFill();
      beginShape();

      for (var i = 0; i < 100; i++) {
        var ms = 5000;
        var amplitude = data.amp / 255;
        if (this.AmplitudeText) {
          amplitude = this.amp;
        }

        var x = i;
        var y = amplitude * cos(2 * PI * this.Frequency * (x / ms));
        x = map(x, 0, 100, this.Xpos, this.Xpos + this.width);
        y = map(y, -1, 1, this.Ypos + this.height, this.Ypos);

        vertex(x, y);
      }

      endShape();
    }
  }
}




// Sound manip
var fft;
var wave;
var sound;
var filter;
var songActive = false;
var songLoaded = false;
var QueueSongOnStartup = false;

// Visualizers
var frequencyVisual;
var amplitudeVisual;
var enlargedVisual;
var separatedWaveVisuals;
var singleWaveVisuals;
var orthonormalWaveVisuals;

// UI
var Title;
var AuthorName;
var disclosure;
var Topic1;
var Topic2;
var Topic3;
var subComment1;
var subComment2;
var subComment3;
var MainColor;
var ContentBarColor;
var volumeSlider;
var soundFreqSlider;
var soundResSlider;
var musicPlayButton;
var UIText;
var fftText;
var waveformText;

function setup() {
  // UI
  createCanvas(1080, 1900);
  MainColor = { r: 255, g: 255, b: 255, a: 255 };
  ContentBarColor = { r: 255, g: 245, b: 255, a: 255 };

  Title = createElement('h1', 'Audio Manipulation');
  Title.position(20, 20);

  AuthorName = createElement('h6', 'By: Eric Marquez');
  AuthorName.position(20, 60);

  disclosure = createElement('h7', 'The music provided in this example is not a product of this website or its author. (Post Malone - Sunflower)');
  disclosure.position(20, 1850);

  Topic1 = createElement('h2', 'Separation of sound waves:');
  Topic1.position(20, 700);

  Topic2 = createElement('h2', 'Combining separate waves:');
  Topic2.position(20, 1120);

  Topic3 = createElement('h2', 'Orthonormal basis of sounds:');
  Topic3.position(20, 1540);

  subComment1 = createElement('h6', 'Values are taken within a 0.2 ms interval.');
  subComment1.position(20, 735);

  subComment2 = createElement('h6', 'Rational ratios result in a more pleasant sound.');
  subComment2.position(20, 1155);

  subComment3 = createElement('h6', 'scaled down to amplitudes from [0,1].');
  subComment3.position(20, 1575);

  musicPlayButton = createButton('Play Music');
  musicPlayButton.position(20, 127);
  musicPlayButton.mousePressed(togglePlayback);

  UIText = createElement('h7', 'Sound Filter Settings:');
  UIText.position(710, 200);
  UIText.style('color', 'rgb(20,20,20)');

  UIText = createElement('h7', 'Volume:');
  UIText.position(710, 230);
  UIText.style('color', 'rgb(20,20,20)');

  UIText = createElement('h7', 'Frequency:');
  UIText.position(710, 260);
  UIText.style('color', 'rgb(20,20,20)');

  UIText = createElement('h7', 'Resonance:');
  UIText.position(710, 290);
  UIText.style('color', 'rgb(20,20,20)');

  volumeSlider = createSlider(0, 1, 0.1, 0.01);
  volumeSlider.position(800, 230);
  volumeSlider.style('color', 'rgb(0,200,0)');

  soundFreqSlider = createSlider(10, 22050, 22050, 100);
  soundFreqSlider.position(800, 260);
  soundFreqSlider.style('color', 'rgb(0,200,0)');

  soundResSlider = createSlider(0, 90, 0, 10);
  soundResSlider.position(800, 290);
  soundResSlider.style('color', 'rgb(0,200,0)');

  //Visualizers and Data manipulators
  fft = new p5.FFT();
  filter = new p5.LowPass();
  frequencyVisual = new Visualizer(20, 200, 200, 100, 'Frequency graph: 0-1024 hz');
  amplitudeVisual = new Visualizer(300, 200, 200, 100, 'Waveform graph: amp = -1, 1');
  enlargedVisual = new Visualizer(20, 360, 700, 280, 'Overview: (Hover over one of the above visuals to see here)');

  separatedWaveVisuals = new Array();

  // Upper row
  separatedWaveVisuals.push(new Visualizer(20, 790, 200, 100, 'Waveform: 440hz', 440));
  separatedWaveVisuals.push(new Visualizer(240, 790, 200, 100, 'Waveform: 110hz', 110));
  separatedWaveVisuals.push(new Visualizer(460, 790, 200, 100, 'Waveform: 120hz', 120));

  // Lower row
  separatedWaveVisuals.push(new Visualizer(20, 920, 200, 100, 'Waveform: 130hz', 130));
  separatedWaveVisuals.push(new Visualizer(240, 920, 200, 100, 'Waveform: 140hz', 140));
  separatedWaveVisuals.push(new Visualizer(460, 920, 200, 100, 'Waveform: 150hz', 150));

  singleWaveVisuals = new Array();

  // Upper row
  singleWaveVisuals.push(new Visualizer(20, 1210, 200, 100, 'Waveform: C - 523Hz', 523, true));
  singleWaveVisuals.push(new Visualizer(240, 1210, 200, 100, 'Waveform: E - 659Hz', 659, true));
  singleWaveVisuals.push(new Visualizer(460, 1210, 200, 100, 'Waveform: G - 784Hz', 784, true));

  // Lower row
  singleWaveVisuals.push(new Visualizer(20, 1340, 200, 100, 'Waveform: A -220Hz', 220, true));
  singleWaveVisuals.push(new Visualizer(240, 1340, 200, 100, 'Waveform: E- 330Hz', 330, true));
  singleWaveVisuals.push(new Visualizer(460, 1340, 200, 100, 'Waveform: A - 55Hz', 55, true));

  orthonormalWaveVisuals = new Array();

  // Upper row
  orthonormalWaveVisuals.push(new Visualizer(20, 1630, 200, 100, 'A - 220Hz Normalized', 220, true));
  orthonormalWaveVisuals.push(new Visualizer(240, 1630, 200, 100, 'E - 659Hz Normalized', 659, true));
  orthonormalWaveVisuals.push(new Visualizer(460, 1630, 200, 100, 'G - 784Hz Normalized', 784, true));

  for (var x = 0; x < orthonormalWaveVisuals.length; x++) {
    var hz = orthonormalWaveVisuals[x].Frequency;

    // 39.59798 represents sqrt(2*hz_max)
    orthonormalWaveVisuals[x].setAmplitude(Math.sqrt(2 * hz) / 39.59798);
  }


  sound = loadSound('./sounds/sunflower.mp3', function (result, err) {
    songLoaded = true;
    sound.disconnect();
    sound.connect(filter);
    filter.set(1000, 1);


    if (QueueSongOnStartup) {
      togglePlayback();
    }

  });

}

function draw() {
  if (!sound.isPlaying()) {
    musicPlayButton.html('Play Music');
  }

  // put drawing code here
  background(MainColor.r, MainColor.g, MainColor.b, MainColor.a);
  sound.setVolume(volumeSlider.value());
  filter.set(soundFreqSlider.value(), soundResSlider.value());

  fill(ContentBarColor.r, ContentBarColor.g, ContentBarColor.b, ContentBarColor.a);
  stroke(20, 20, 20, 50);
  rect(10, 180, width - 100, 140);

  var wave = fft.waveform();
  var freq = fft.analyze()
  amplitudeVisual.draw(0, wave);
  frequencyVisual.draw(1, freq);

  stroke(20, 20, 20, 50);
  fill(ContentBarColor.r, ContentBarColor.g, ContentBarColor.b, ContentBarColor.a);
  if (amplitudeVisual.MouseInBounds()) {
    rect(10, 340, width - 100, 320);
    enlargedVisual.draw(0, wave);
  } else if (frequencyVisual.MouseInBounds()) {
    rect(10, 340, width - 100, 320);
    enlargedVisual.draw(1, freq);
  } else {
    rect(10, 340, width - 100, 320);
    enlargedVisual.draw(1, new Array());
  }

  stroke(20, 20, 20, 50);
  fill(ContentBarColor.r, ContentBarColor.g, ContentBarColor.b, ContentBarColor.a);
  rect(10, 750, width - 100, 320);

  for (var i = 0; i < separatedWaveVisuals.length; i++) {
    var hz = separatedWaveVisuals[i].Frequency;
    separatedWaveVisuals[i].draw(2, { amp: freq[hz] });
  }

  stroke(20, 20, 20, 50);
  fill(ContentBarColor.r, ContentBarColor.g, ContentBarColor.b, ContentBarColor.a);
  rect(10, 1170, width - 100, 320);

  for (var i = 0; i < singleWaveVisuals.length; i++) {
    var hz = singleWaveVisuals[i].Frequency;
    singleWaveVisuals[i].setVolume(volumeSlider.value());
    singleWaveVisuals[i].draw(2, { amp: freq[hz] });
    // console.log(freq.length);
  }

  stroke(20, 20, 20, 50);
  fill(ContentBarColor.r, ContentBarColor.g, ContentBarColor.b, ContentBarColor.a);
  rect(10, 1590, width - 100, 200);

  for (var i = 0; i < orthonormalWaveVisuals.length; i++) {
    var hz = orthonormalWaveVisuals[i].Frequency;
    // 39.59798 represents sqrt(2*hz_max)
    orthonormalWaveVisuals[i].setVolume(volumeSlider.value());
    orthonormalWaveVisuals[i].draw(2, { amp: Math.sqrt(2 * hz) / 39.59798 });
    // console.log(freq.length);
  }
}

function togglePlayback() {
  if (songLoaded) {
    // Toggle Playback functions
    if (!sound.isPlaying()) {
      if (!songActive) {
        songActive = true;
        QueueSongOnStartup = false;
      }
      musicPlayButton.html('Pause Music');
      sound.play();
      sound.setVolume(volumeSlider.value(), 0.5);
    } else {
      musicPlayButton.html('Play Music');
      sound.setVolume(0, 0.5);
      sound.pause();
    }
  } else {
    QueueSongOnStartup = true;
  }
}