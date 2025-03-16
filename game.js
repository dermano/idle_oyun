// Oyun değişkenleri
let gold = 0;
let wood = 0;
let stone = 0;
let iron = 0;
let currentDifficulty = 'Başlangıç';

// Oyuncu değişkenleri
let playerLevel = 1;
let playerXP = 0;
let xpRequired = 100;

// Üretici seviyeleri ve maliyetleri
const producers = {
    goldMiner: { level: 1, cost: 50, production: 1, costMultiplier: 1.5, productionIncrease: 1.2 },
    woodcutter: { level: 1, cost: 30, production: 1, costMultiplier: 1.5, productionIncrease: 1.2 },
    stoneMiner: { level: 1, cost: 100, production: 1, costMultiplier: 1.5, productionIncrease: 1.2 },
    ironMiner: { level: 1, cost: 200, production: 1, costMultiplier: 1.5, productionIncrease: 1.2 }
};

// Tıklama ile ilgili değişkenler
let clickPoints = 1;
let clickPower = 1;

// Dönüşüm oranlarını ekleyelim
const conversionRates = {
    wood: 2,    // 1 odun = 2 altın
    stone: 5,   // 1 taş = 5 altın
    iron: 10    // 1 demir = 10 altın
};

// DOM elementleri
const elements = {
    // Kaynaklar
    gold: document.getElementById('gold'),
    wood: document.getElementById('wood'),
    stone: document.getElementById('stone'),
    iron: document.getElementById('iron'),
    
    // Üretim hızları
    goldRate: document.getElementById('goldRate'),
    woodRate: document.getElementById('woodRate'),
    stoneRate: document.getElementById('stoneRate'),
    ironRate: document.getElementById('ironRate'),
    
    // Üretici seviyeleri
    goldMinerLevel: document.getElementById('goldMinerLevel'),
    woodcutterLevel: document.getElementById('woodcutterLevel'),
    stoneMinerLevel: document.getElementById('stoneMinerLevel'),
    ironMinerLevel: document.getElementById('ironMinerLevel'),
    
    // Üretim miktarları
    goldMinerProduction: document.getElementById('goldMinerProduction'),
    woodcutterProduction: document.getElementById('woodcutterProduction'),
    stoneMinerProduction: document.getElementById('stoneMinerProduction'),
    ironMinerProduction: document.getElementById('ironMinerProduction'),
    
    // Maliyetler
    goldMinerCost: document.getElementById('goldMinerCost'),
    woodcutterCost: document.getElementById('woodcutterCost'),
    stoneMinerCost: document.getElementById('stoneMinerCost'),
    ironMinerCost: document.getElementById('ironMinerCost'),
    
    // İlerleme çubukları
    goldProgress: document.querySelector('.gold-progress'),
    woodProgress: document.querySelector('.wood-progress'),
    stoneProgress: document.querySelector('.stone-progress'),
    ironProgress: document.querySelector('.iron-progress'),
    
    // Oyuncu bilgileri
    playerLevel: document.getElementById('playerLevel'),
    playerXP: document.getElementById('playerXP'),
    xpRequired: document.getElementById('xpRequired'),
    xpProgress: document.querySelector('.xp-progress')
};

// Görev listesi ve ödülleri tanımlayalım
const tasks = {
    task1: {
        id: 'task1',
        description: '10 saniye içinde 50 altın topla!',
        target: 50,
        time: 10,
        rewards: {
            gold: 100,
            xp: 20
        },
        isActive: false,
        startTime: null,
        initialGold: 0
    },
    task2: {
        id: 'task2',
        description: '5 saniye içinde 20 odun topla!',
        target: 20,
        time: 5,
        rewards: {
            gold: 150,
            xp: 25
        },
        isActive: false,
        startTime: null,
        initialWood: 0
    },
    task3: {
        id: 'task3',
        description: '3 saniye içinde 10 taş topla!',
        target: 10,
        time: 3,
        rewards: {
            gold: 200,
            xp: 30
        },
        isActive: false,
        startTime: null,
        initialStone: 0
    }
};

// Ses yönetimi için AudioManager'ı güncelle
const audioManager = {
    settings: {
        soundVolume: 50,
        musicVolume: 50,
        soundEnabled: true,
        musicEnabled: true
    },

    // Klasik müzik notaları (frekanslar)
    musicNotes: {
        'Für Elise': [
            329.63, 311.13, 329.63, 311.13, 329.63, 246.94, 293.66, 261.63, 220.00,
            146.83, 174.61, 220.00, 261.63, 164.81, 220.00, 261.63
        ],
        'Turkish March': [
            440.00, 493.88, 523.25, 493.88, 440.00, 392.00, 349.23, 392.00,
            440.00, 493.88, 523.25, 493.88, 440.00, 392.00, 349.23, 392.00
        ],
        'Moonlight Sonata': [
            261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 329.63,
            392.00, 523.25, 392.00, 329.63, 261.63, 196.00, 261.63, 329.63
        ]
    },

    currentMusicIndex: 0,
    currentNoteIndex: 0,
    audioContext: null,
    oscillator: null,
    gainNode: null,
    isPlaying: false,

    // Müzik kontrolü için yeni özellik
    isMusicPlaying: false,

    // Ses efektleri için yeni özellikler
    sounds: {
        click: {
            frequency: 800,
            duration: 50
        },
        success: {
            frequency: 1200,
            duration: 100
        },
        error: {
            frequency: 300,
            duration: 200
        },
        levelup: {
            frequency: 1500,
            duration: 150
        }
    },

    initializeAudio() {
        try {
            // Kullanıcı etkileşimi gerektiğini belirten mesaj
            const musicMessage = document.createElement('div');
            musicMessage.className = 'message info';
            musicMessage.textContent = 'Müziği başlatmak için herhangi bir yere tıklayın';
            document.querySelector('.container').appendChild(musicMessage);

            // Kullanıcının ilk tıklamasını bekle
            const startAudio = () => {
                this.startMusic();
                document.removeEventListener('click', startAudio);
                musicMessage.remove();
            };

            document.addEventListener('click', startAudio, { once: true });
        } catch (error) {
            console.error('Audio initialization error:', error);
        }
    },

    // Müzik başlatma fonksiyonunu güncelle
    startMusic() {
        if (!this.settings.musicEnabled) return;

        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (!this.gainNode) {
                this.gainNode = this.audioContext.createGain();
                this.gainNode.connect(this.audioContext.destination);
            }

            this.isPlaying = true;
            this.isMusicPlaying = true;
            this.playNextNote();
            
            // Müzik durumu butonunu güncelle
            this.updateMusicButton();
        } catch (error) {
            console.error('Müzik başlatma hatası:', error);
        }
    },

    playNextNote() {
        if (!this.isPlaying) return;

        const currentSong = Object.keys(this.musicNotes)[this.currentMusicIndex];
        const notes = this.musicNotes[currentSong];

        try {
            // Önceki notayı temizle
            if (this.oscillator) {
                this.oscillator.stop();
                this.oscillator.disconnect();
            }

            // Yeni nota oluştur
            this.oscillator = this.audioContext.createOscillator();
            this.oscillator.type = 'sine';
            this.oscillator.frequency.value = notes[this.currentNoteIndex];
            
            // Ses seviyesini ayarla
            this.gainNode.gain.value = this.settings.musicVolume / 500;
            
            // Bağlantıları yap ve çal
            this.oscillator.connect(this.gainNode);
            this.oscillator.start();

            // Sonraki notaya geç
            this.currentNoteIndex = (this.currentNoteIndex + 1) % notes.length;

            // Nota süresini ayarla (250ms)
            setTimeout(() => {
                if (this.isPlaying) {
                    this.playNextNote();
                }
            }, 250);

        } catch (error) {
            console.error('Nota çalma hatası:', error);
        }
    },

    playNextTrack() {
        this.currentMusicIndex = (this.currentMusicIndex + 1) % Object.keys(this.musicNotes).length;
        this.currentNoteIndex = 0;
        this.updateCurrentTrackDisplay();
    },

    playPreviousTrack() {
        this.currentMusicIndex = (this.currentMusicIndex - 1 + Object.keys(this.musicNotes).length) % Object.keys(this.musicNotes).length;
        this.currentNoteIndex = 0;
        this.updateCurrentTrackDisplay();
    },

    // Müzik durdurma fonksiyonunu güncelle
    stopMusic() {
        this.isPlaying = false;
        this.isMusicPlaying = false;
        if (this.oscillator) {
            try {
                this.oscillator.stop();
                this.oscillator.disconnect();
            } catch (error) {
                console.error('Müzik durdurma hatası:', error);
            }
        }
        
        // Müzik durumu butonunu güncelle
        this.updateMusicButton();
    },

    updateVolumes() {
        if (this.gainNode) {
            this.gainNode.gain.value = this.settings.musicEnabled ? 
                this.settings.musicVolume / 500 : 0;
        }
    },

    updateCurrentTrackDisplay() {
        const currentTrackElement = document.getElementById('currentTrack');
        if (currentTrackElement) {
            currentTrackElement.textContent = 'Şu an çalan: ' + 
                Object.keys(this.musicNotes)[this.currentMusicIndex];
        }
    },

    // Ses efekti çalma fonksiyonu
    playBeep(type) {
        if (!this.settings.soundEnabled) return;
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            const sound = this.sounds[type] || this.sounds.click;
            oscillator.frequency.value = sound.frequency;
            gainNode.gain.value = this.settings.soundVolume / 200;

            oscillator.start();
            setTimeout(() => {
                oscillator.stop();
                oscillator.disconnect();
                gainNode.disconnect();
            }, sound.duration);

        } catch (error) {
            console.error('Ses efekti çalma hatası:', error);
        }
    },

    // Müzik durumunu değiştirme fonksiyonu
    toggleMusic() {
        if (this.isMusicPlaying) {
            this.stopMusic();
        } else {
            this.startMusic();
        }
    },

    // Müzik butonunu güncelleme fonksiyonu
    updateMusicButton() {
        const toggleMusicBtn = document.getElementById('toggleMusic');
        if (toggleMusicBtn) {
            if (this.isMusicPlaying) {
                toggleMusicBtn.innerHTML = '<i class="fas fa-pause"></i>';
                toggleMusicBtn.title = 'Müziği Durdur';
            } else {
                toggleMusicBtn.innerHTML = '<i class="fas fa-play"></i>';
                toggleMusicBtn.title = 'Müziği Başlat';
            }
        }
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    try {
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsMenu = document.getElementById('settingsMenu');
        const closeSettings = document.getElementById('closeSettings');
        
        if (settingsBtn && settingsMenu && closeSettings) {
            // Ayarlar menüsünü aç/kapat
            settingsBtn.addEventListener('click', () => {
                settingsMenu.style.display = 'flex';
                audioManager.playBeep('click');
            });
            
            closeSettings.addEventListener('click', () => {
                settingsMenu.style.display = 'none';
                audioManager.playBeep('click');
            });
        }
        
        // Müzik kontrolü için yeni event listener'lar
        const musicVolume = document.getElementById('musicVolume');
        const musicVolumeValue = document.getElementById('musicVolumeValue');
        const musicEnabled = document.getElementById('musicEnabled');
        
        if (musicVolume && musicVolumeValue) {
            musicVolume.addEventListener('input', (e) => {
                audioManager.settings.musicVolume = e.target.value;
                musicVolumeValue.textContent = e.target.value + '%';
                audioManager.updateVolumes();
            });
        }
        
        if (musicEnabled) {
            musicEnabled.addEventListener('change', (e) => {
                audioManager.settings.musicEnabled = e.target.checked;
                if (e.target.checked) {
                    audioManager.startMusic();
                } else {
                    audioManager.stopMusic();
                }
            });
        }

        // Sayfa yüklendiğinde müzik başlatma işlemini değiştir
        if (audioManager.settings.musicEnabled) {
            audioManager.initializeAudio();
        }
        
        // Ses ayarlarını güncelle
        const soundVolume = document.getElementById('soundVolume');
        const soundVolumeValue = document.getElementById('soundVolumeValue');
        const soundEnabled = document.getElementById('soundEnabled');
        
        if (soundVolume && soundVolumeValue) {
            soundVolume.addEventListener('input', (e) => {
                audioManager.settings.soundVolume = e.target.value;
                soundVolumeValue.textContent = e.target.value + '%';
                audioManager.playBeep('click');
            });
        }
        
        if (soundEnabled) {
            soundEnabled.addEventListener('change', (e) => {
                audioManager.settings.soundEnabled = e.target.checked;
                if (e.target.checked) {
                    audioManager.playBeep('click');
                }
            });
        }

        // Müzik kontrol butonları
        const prevTrack = document.getElementById('prevTrack');
        const nextTrack = document.getElementById('nextTrack');
        
        if (prevTrack) {
            prevTrack.addEventListener('click', () => {
                audioManager.playPreviousTrack();
                updateCurrentTrackDisplay();
            });
        }
        
        if (nextTrack) {
            nextTrack.addEventListener('click', () => {
                audioManager.playNextTrack();
                updateCurrentTrackDisplay();
            });
        }

        // Müzik kontrol butonları
        const toggleMusicBtn = document.getElementById('toggleMusic');
        
        if (toggleMusicBtn) {
            toggleMusicBtn.addEventListener('click', () => {
                audioManager.toggleMusic();
                audioManager.playBeep('click');
            });
        }

        function updateCurrentTrackDisplay() {
            const currentTrackElement = document.getElementById('currentTrack');
            if (currentTrackElement) {
                currentTrackElement.textContent = 'Şu an çalan: ' + 
                    audioManager.musicNotes[audioManager.currentMusicIndex];
            }
        }
    } catch (error) {
        console.error('Event listener hatası:', error);
    }
});

// Gold Miner için maliyet hesaplama fonksiyonu
function calculateGoldMinerCost() {
    const currentLevel = parseInt(document.getElementById('goldMinerLevel').textContent);
    return Math.floor(50 * Math.pow(1.5, currentLevel - 1));
}

function buyAutoGoldMiner() {
    const currentCost = calculateGoldMinerCost();
    if (gold >= currentCost) {
        gold -= currentCost;
        producers.goldMiner.level++;
        producers.goldMiner.production *= producers.goldMiner.productionIncrease;
        
        // Ekranı güncelle
        document.getElementById('goldMinerLevel').textContent = producers.goldMiner.level;
        document.getElementById('goldMinerProduction').textContent = 
            Math.floor(producers.goldMiner.production * 10) / 10;
        document.getElementById('goldMinerCost').textContent = calculateGoldMinerCost();
            
        updateDisplay();
        addXP(10);
        showSuccessMessage('Altın Madencisi seviye yükseltildi!');
    } else {
        showErrorMessage(`Yeterli altınınız yok! ${currentCost} altın gerekiyor.`);
    }
}

// Woodcutter için maliyet hesaplama fonksiyonu ekleyelim
function calculateWoodcutterCost() {
    return Math.floor(30 * Math.pow(1.5, producers.woodcutter.level - 1));
}

function buyAutoWoodcutter() {
    const currentCost = calculateWoodcutterCost();
    if (gold >= currentCost) {
        gold -= currentCost;
        producers.woodcutter.level++;
        producers.woodcutter.production *= producers.woodcutter.productionIncrease;
        
        // Ekranı güncelle
        document.getElementById('woodcutterLevel').textContent = producers.woodcutter.level;
        document.getElementById('woodcutterProduction').textContent = 
            Math.floor(producers.woodcutter.production * 10) / 10;
        document.getElementById('woodcutterCost').textContent = calculateWoodcutterCost();
            
        updateDisplay();
        addXP(8);
        showSuccessMessage('Oduncu seviye yükseltildi!');
    } else {
        showErrorMessage(`Yeterli altınınız yok! ${currentCost} altın gerekiyor.`);
    }
}

// Stone Miner için maliyet hesaplama fonksiyonu
function calculateStoneMinerCost() {
    const currentLevel = parseInt(document.getElementById('stoneMinerLevel').textContent);
    return Math.floor(100 * Math.pow(1.5, currentLevel - 1));
}

// Iron Miner için maliyet hesaplama fonksiyonu
function calculateIronMinerCost() {
    const currentLevel = parseInt(document.getElementById('ironMinerLevel').textContent);
    return Math.floor(200 * Math.pow(1.5, currentLevel - 1));
}

// Stone Miner satın alma fonksiyonunu güncelle
function buyAutoStoneMiner() {
    const currentCost = calculateStoneMinerCost();
    if (gold >= currentCost) {
        gold -= currentCost;
        producers.stoneMiner.level++;
        producers.stoneMiner.production *= producers.stoneMiner.productionIncrease;
        
        // Ekranı güncelle
        document.getElementById('stoneMinerLevel').textContent = producers.stoneMiner.level;
        document.getElementById('stoneMinerProduction').textContent = 
            Math.floor(producers.stoneMiner.production * 10) / 10;
        document.getElementById('stoneMinerCost').textContent = calculateStoneMinerCost();
            
        updateDisplay();
        addXP(15);
        showSuccessMessage('Taş Madencisi seviye yükseltildi!');
    } else {
        showErrorMessage(`Yeterli altınınız yok! ${currentCost} altın gerekiyor.`);
    }
}

// Iron Miner satın alma fonksiyonunu güncelle
function buyAutoIronMiner() {
    const currentCost = calculateIronMinerCost();
    if (gold >= currentCost) {
        gold -= currentCost;
        producers.ironMiner.level++;
        producers.ironMiner.production *= producers.ironMiner.productionIncrease;
        
        // Ekranı güncelle
        document.getElementById('ironMinerLevel').textContent = producers.ironMiner.level;
        document.getElementById('ironMinerProduction').textContent = 
            Math.floor(producers.ironMiner.production * 10) / 10;
        document.getElementById('ironMinerCost').textContent = calculateIronMinerCost();
            
        updateDisplay();
        addXP(20);
        showSuccessMessage('Demir Madencisi seviye yükseltildi!');
    } else {
        showErrorMessage(`Yeterli altınınız yok! ${currentCost} altın gerekiyor.`);
    }
}

// Tecrübe puanı sistemi
function addXP(amount) {
    const previousLevel = playerLevel;
    playerXP += amount;
    while (playerXP >= xpRequired) {
        playerXP -= xpRequired;
        playerLevel++;
        xpRequired = Math.floor(xpRequired * 1.5);
        showSuccessMessage(`Tebrikler! Seviye ${playerLevel} oldunuz!`);
        if (playerLevel > previousLevel) {
            audioManager.playBeep('levelup');
        }
    }
    updateXPBar();
}

function updateXPBar() {
    const progress = (playerXP / xpRequired) * 100;
    elements.xpProgress.style.width = `${progress}%`;
    elements.playerLevel.textContent = playerLevel;
    elements.playerXP.textContent = Math.floor(playerXP);
    elements.xpRequired.textContent = Math.floor(xpRequired);
}

// İlerleme çubuğu animasyonu
function updateProgressBars() {
    elements.goldProgress.style.width = '0%';
    elements.woodProgress.style.width = '0%';
    elements.stoneProgress.style.width = '0%';
    elements.ironProgress.style.width = '0%';
    
    setTimeout(() => {
        elements.goldProgress.style.width = '100%';
        elements.woodProgress.style.width = '100%';
        elements.stoneProgress.style.width = '100%';
        elements.ironProgress.style.width = '100%';
    }, 50);
}

// Mesaj gösterme fonksiyonları
function showSuccessMessage(message) {
    showMessage(message, 'success');
    if (audioManager && typeof audioManager.playBeep === 'function') {
        audioManager.playBeep('success');
    }
}

function showErrorMessage(message) {
    showMessage(message, 'error');
    if (audioManager && typeof audioManager.playBeep === 'function') {
        audioManager.playBeep('error');
    }
}

function showMessage(message, type) {
    const container = document.querySelector('.container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    container.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 2000);
}

// Manuel altın toplama fonksiyonu
function clickGold() {
    try {
        // Tıklama gücü kadar altın kazanma
        const goldGain = clickPower;
        gold += goldGain;
        
        // Tıklama puanını artır
        clickPoints += 1;
        
        // Her 10 puanda tıklama gücünü artır
        if (clickPoints % 10 === 0) {
            clickPower++;
            document.getElementById('clickPower').textContent = clickPower;
            showSuccessMessage('Tıklama gücün arttı! Yeni güç: ' + clickPower);
        }
        
        // Görsel efektler
        const goldResource = document.querySelector('.gold-resource');
        if (goldResource) {
            const pointsText = document.createElement('span');
            pointsText.className = 'click-points';
            pointsText.textContent = `+${goldGain}`;
            pointsText.style.position = 'absolute';
            pointsText.style.left = '50%';
            pointsText.style.top = '50%';
            goldResource.appendChild(pointsText);
            
            // Efekti kaldır
            setTimeout(() => {
                pointsText.remove();
            }, 500);
        }
        
        // XP ekle ve ekranı güncelle
        addXP(1);
        updateDisplay();
        animateResourceGain('gold');
        
        // Oyun verilerini kaydet
        saveGameData();

        // Ses efektini güvenli bir şekilde çal
        if (audioManager && typeof audioManager.playBeep === 'function') {
            audioManager.playBeep('click');
        }

    } catch (error) {
        console.error('Click gold error:', error);
    }
}

// Kaynak kazanma animasyonu
function animateResourceGain(type) {
    try {
        // Resource elementini bul
        const resourceElement = document.querySelector(`.${type}-resource`);
        if (!resourceElement) return;

        // Sayı elementini bul
        const numberElement = resourceElement.querySelector('p');
        if (!numberElement) return;

        // Buton elementini bul
        const button = resourceElement.querySelector('.collect-btn');
        if (!button) return;

        // Animasyonları uygula
        button.style.transform = 'scale(0.95)';
        numberElement.style.transform = 'scale(1.2)';
        numberElement.style.color = '#27ae60';

        // Animasyonları geri al
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            numberElement.style.transform = 'scale(1)';
            numberElement.style.color = '#2c3e50';
        }, 200);

        // Ses efektini güvenli bir şekilde çal
        if (audioManager && typeof audioManager.playBeep === 'function') {
            audioManager.playBeep('click');
        }

    } catch (error) {
        console.error('Animasyon hatası:', error);
    }
}

// Otomatik üretim
setInterval(() => {
    if (producers.goldMiner.level > 1 || producers.woodcutter.level > 1 || 
        producers.stoneMiner.level > 1 || producers.ironMiner.level > 1) {
        
        gold += producers.goldMiner.production * (producers.goldMiner.level - 1);
        wood += producers.woodcutter.production * (producers.woodcutter.level - 1);
        stone += producers.stoneMiner.production * (producers.stoneMiner.level - 1);
        iron += producers.ironMiner.production * (producers.ironMiner.level - 1);
        
        updateDisplay();
        updateProgressBars();
    }
}, 1000);

// Oyun başladığında verileri yükle
window.onload = function() {
    // Önce localStorage'dan verileri kontrol et ve yükle
    loadGameData();
    
    // Ekranı güncelle
    updateDisplay();
    updateXPBar();
    
    // Tıklama puanı ve gücünü göster
    document.getElementById('clickPoints').textContent = clickPoints;
    document.getElementById('clickPower').textContent = clickPower;
    
    // Üretici seviyelerini güncelle
    document.getElementById('goldMinerLevel').textContent = producers.goldMiner.level;
    document.getElementById('woodcutterLevel').textContent = producers.woodcutter.level;
    document.getElementById('stoneMinerLevel').textContent = producers.stoneMiner.level;
    document.getElementById('ironMinerLevel').textContent = producers.ironMiner.level;
    
    // Woodcutter maliyetini güncelle
    document.getElementById('woodcutterCost').textContent = calculateWoodcutterCost();
    
    // Gold Miner maliyetini güncelle
    document.getElementById('goldMinerCost').textContent = calculateGoldMinerCost();
    
    // Stone Miner maliyetini güncelle
    document.getElementById('stoneMinerCost').textContent = calculateStoneMinerCost();
    
    // Iron Miner maliyetini güncelle
    document.getElementById('ironMinerCost').textContent = calculateIronMinerCost();
}

// Oyun verilerini yükleme fonksiyonunu güncelle
function loadGameData() {
    const savedData = localStorage.getItem('idleGameSave');
    if (savedData) {
        try {
        const gameData = JSON.parse(savedData);
        
            // Ana kaynakları yükle
            gold = Number(gameData.gold) || 0;
            wood = Number(gameData.wood) || 0;
            stone = Number(gameData.stone) || 0;
            iron = Number(gameData.iron) || 0;
            
            // Oyuncu verilerini yükle
            clickPoints = Number(gameData.clickPoints) || 0;
            clickPower = Number(gameData.clickPower) || 1;
            playerLevel = Number(gameData.playerLevel) || 1;
            playerXP = Number(gameData.playerXP) || 0;
            
            // Üreticileri yükle
            if (gameData.producers) {
                producers.goldMiner = gameData.producers.goldMiner || { level: 1, production: 1 };
                producers.woodcutter = gameData.producers.woodcutter || { level: 1, production: 1 };
                producers.stoneMiner = gameData.producers.stoneMiner || { level: 1, production: 1 };
                producers.ironMiner = gameData.producers.ironMiner || { level: 1, production: 1 };
            }
            
            // Zorluk seviyesini yükle
            currentDifficulty = gameData.currentDifficulty || 'Başlangıç';
            
        } catch (error) {
            console.error('Oyun verilerini yüklerken hata:', error);
            // Hata durumunda varsayılan değerleri kullan
            resetGameData();
        }
    }
}

// Oyun verilerini kaydetme fonksiyonunu güncelle
function saveGameData() {
    try {
        const gameData = {
            gold: Number(gold),
            wood: Number(wood),
            stone: Number(stone),
            iron: Number(iron),
            clickPoints: Number(clickPoints),
            clickPower: Number(clickPower),
            playerLevel: Number(playerLevel),
            playerXP: Number(playerXP),
            producers: producers,
            currentDifficulty: currentDifficulty
        };
        localStorage.setItem('idleGameSave', JSON.stringify(gameData));
    } catch (error) {
        console.error('Oyun verilerini kaydederken hata:', error);
    }
}

// Hata durumunda oyunu sıfırlama fonksiyonu
function resetGameData() {
    gold = 0;
    wood = 0;
    stone = 0;
    iron = 0;
    clickPoints = 0;
    clickPower = 1;
    playerLevel = 1;
    playerXP = 0;
    producers = {
        goldMiner: { level: 1, production: 1 },
        woodcutter: { level: 1, production: 1 },
        stoneMiner: { level: 1, production: 1 },
        ironMiner: { level: 1, production: 1 }
    };
    currentDifficulty = 'Başlangıç';
}

// updateDisplay fonksiyonunu güncelle
function updateDisplay() {
    // Kaynakları güncelle
    document.getElementById('gold').textContent = Math.floor(gold);
    document.getElementById('wood').textContent = Math.floor(wood);
    document.getElementById('stone').textContent = Math.floor(stone);
    document.getElementById('iron').textContent = Math.floor(iron);
    document.getElementById('clickPoints').textContent = clickPoints;
    document.getElementById('clickPower').textContent = clickPower;
    
    // Üretim hızlarını güncelle
    document.getElementById('goldRate').textContent = 
        Math.floor(producers.goldMiner.production * (producers.goldMiner.level - 1));
    document.getElementById('woodRate').textContent = 
        Math.floor(producers.woodcutter.production * (producers.woodcutter.level - 1));
    document.getElementById('stoneRate').textContent = 
        Math.floor(producers.stoneMiner.production * (producers.stoneMiner.level - 1));
    document.getElementById('ironRate').textContent = 
        Math.floor(producers.ironMiner.production * (producers.ironMiner.level - 1));
    
    // Her güncellemede oyunu kaydet
    saveGameData();
}

// Belirli aralıklarla otomatik kaydetme
setInterval(saveGameData, 30000); // Her 30 saniyede bir kaydet

// Consolidate all your functions here
function checkDifficultyLevel() {
    // Add error handling
    try {
        // ... existing code ...
    } catch (error) {
        console.error('Error checking difficulty:', error);
    }
}

function displayChallenge(challenge) {
    try {
        const challengeElement = document.getElementById('challengeDisplay');
        if (!challengeElement) throw new Error('Challenge display element not found');
        // ... existing code ...
    } catch (error) {
        console.error('Error displaying challenge:', error);
    }
}

// Tıklama alanı için event listener
document.getElementById('clickArea').addEventListener('click', function(e) {
    // Tıklama puanını artır
    clickPoints += clickPower;
    
    // Puanları güncelle
    document.getElementById('clickPoints').textContent = clickPoints;
    
    // Tıklama efekti
    const pointsText = document.createElement('span');
    pointsText.className = 'click-points';
    pointsText.textContent = `+${clickPower}`;
    
    // Tıklanan konuma göre pozisyonu ayarla
    pointsText.style.left = (e.clientX - e.target.getBoundingClientRect().left) + 'px';
    pointsText.style.top = (e.clientY - e.target.getBoundingClientRect().top) + 'px';
    
    this.appendChild(pointsText);
    
    // Animasyon bitince elementi kaldır
    setTimeout(() => {
        pointsText.remove();
    }, 500);
    
    // Her 100 puanda tıklama gücünü artır
    if (clickPoints % 100 === 0) {
        clickPower++;
        document.getElementById('clickPower').textContent = clickPower;
        showMessage('Tıklama gücün arttı!', 'success');
    }
});

// Dönüştürme fonksiyonlarını ekleyelim
function convertWoodToGold() {
    if (wood >= 1) {
        const convertAmount = Math.floor(wood); // Tüm odunu çevir
        gold += convertAmount * conversionRates.wood;
        wood -= convertAmount;
        showSuccessMessage(`${convertAmount} odun ${convertAmount * conversionRates.wood} altına dönüştürüldü!`);
        updateDisplay();
    } else {
        showErrorMessage('Dönüştürmek için yeterli odun yok!');
    }
}

function convertStoneToGold() {
    if (stone >= 1) {
        const convertAmount = Math.floor(stone); // Tüm taşı çevir
        gold += convertAmount * conversionRates.stone;
        stone -= convertAmount;
        showSuccessMessage(`${convertAmount} taş ${convertAmount * conversionRates.stone} altına dönüştürüldü!`);
        updateDisplay();
    } else {
        showErrorMessage('Dönüştürmek için yeterli taş yok!');
    }
}

function convertIronToGold() {
    if (iron >= 1) {
        const convertAmount = Math.floor(iron); // Tüm demiri çevir
        gold += convertAmount * conversionRates.iron;
        iron -= convertAmount;
        showSuccessMessage(`${convertAmount} demir ${convertAmount * conversionRates.iron} altına dönüştürüldü!`);
        updateDisplay();
    } else {
        showErrorMessage('Dönüştürmek için yeterli demir yok!');
    }
}

// Oyunu sıfırlama onay fonksiyonu
function confirmReset() {
    if (confirm('Oyunu sıfırlamak istediğinize emin misiniz? Tüm ilerlemeniz silinecek!')) {
        resetGame();
    }
}

// Oyunu sıfırlama fonksiyonu
function resetGame() {
    // Tüm değişkenleri sıfırla
    gold = 0;
    wood = 0;
    stone = 0;
    iron = 0;
    clickPoints = 0;
    clickPower = 1;
    playerLevel = 1;
    playerXP = 0;
    xpRequired = 100;
    currentDifficulty = 'Başlangıç';
    
    // Üreticileri sıfırla
    producers.goldMiner = { level: 1, cost: 50, production: 1, costMultiplier: 1.5, productionIncrease: 1.2 };
    producers.woodcutter = { level: 1, cost: 30, production: 1, costMultiplier: 1.5, productionIncrease: 1.2 };
    producers.stoneMiner = { level: 1, cost: 100, production: 1, costMultiplier: 1.5, productionIncrease: 1.2 };
    producers.ironMiner = { level: 1, cost: 200, production: 1, costMultiplier: 1.5, productionIncrease: 1.2 };
    
    // LocalStorage'ı temizle
    localStorage.removeItem('idleGameSave');
    
    // Ekranı güncelle
    updateDisplay();
    updateXPBar();
    
    // Üretici seviyelerini güncelle
    document.getElementById('goldMinerLevel').textContent = '1';
    document.getElementById('woodcutterLevel').textContent = '1';
    document.getElementById('stoneMinerLevel').textContent = '1';
    document.getElementById('ironMinerLevel').textContent = '1';
    
    // Woodcutter maliyetini güncelle
    document.getElementById('woodcutterCost').textContent = calculateWoodcutterCost();
    
    // Gold Miner maliyetini güncelle
    document.getElementById('goldMinerCost').textContent = calculateGoldMinerCost();
    
    // Stone Miner maliyetini güncelle
    document.getElementById('stoneMinerCost').textContent = calculateStoneMinerCost();
    
    // Iron Miner maliyetini güncelle
    document.getElementById('ironMinerCost').textContent = calculateIronMinerCost();
    
    // Başarılı mesajı göster
    showSuccessMessage('Oyun başarıyla sıfırlandı!');
}

// Görev başlatma fonksiyonu
function startTask(taskId) {
    const task = tasks[taskId];
    if (!task.isActive) {
        task.isActive = true;
        task.startTime = Date.now();
        
        // Başlangıç kaynak miktarını kaydet
        switch(taskId) {
            case 'task1':
                task.initialGold = gold;
                break;
            case 'task2':
                task.initialWood = wood;
                break;
            case 'task3':
                task.initialStone = stone;
                break;
        }
        
        // Görev süresini başlat
        setTimeout(() => checkTaskCompletion(taskId), task.time * 1000);
        
        // Görevi görsel olarak aktif et
        document.getElementById(taskId).classList.add('active-task');
        showSuccessMessage(`${task.description} görevi başladı!`);
    }
}

// Görev tamamlanma kontrolü
function checkTaskCompletion(taskId) {
    const task = tasks[taskId];
    if (task.isActive) {
        let completed = false;
        let collected = 0;
        
        switch(taskId) {
            case 'task1':
                collected = gold - task.initialGold;
                completed = collected >= task.target;
                break;
            case 'task2':
                collected = wood - task.initialWood;
                completed = collected >= task.target;
                break;
            case 'task3':
                collected = stone - task.initialStone;
                completed = collected >= task.target;
                break;
        }
        
        if (completed) {
            // Ödülleri ver
            gold += task.rewards.gold;
            addXP(task.rewards.xp);
            showSuccessMessage(`Tebrikler! Görevi tamamladınız! Kazanılan: ${task.rewards.gold} altın, ${task.rewards.xp} TP`);
        } else {
            showErrorMessage('Görev tamamlanamadı!');
        }
        
        // Görevi sıfırla
        task.isActive = false;
        document.getElementById(taskId).classList.remove('active-task');
        updateDisplay();
    }
}

// Oyun verilerini kaydetme fonksiyonu
function saveToSlot(slotNumber) {
    try {
        const saveData = {
            timestamp: new Date().toLocaleString(),
            gameData: {
                gold: gold,
                wood: wood,
                stone: stone,
                iron: iron,
                clickPoints: clickPoints,
                clickPower: clickPower,
                playerLevel: playerLevel,
                playerXP: playerXP,
                producers: {
                    goldMiner: {
                        level: parseInt(document.getElementById('goldMinerLevel').textContent),
                        production: parseFloat(document.getElementById('goldMinerProduction').textContent),
                        cost: parseInt(document.getElementById('goldMinerCost').textContent)
                    },
                    woodcutter: {
                        level: parseInt(document.getElementById('woodcutterLevel').textContent),
                        production: parseFloat(document.getElementById('woodcutterProduction').textContent),
                        cost: parseInt(document.getElementById('woodcutterCost').textContent)
                    },
                    stoneMiner: {
                        level: parseInt(document.getElementById('stoneMinerLevel').textContent),
                        production: parseFloat(document.getElementById('stoneMinerProduction').textContent),
                        cost: parseInt(document.getElementById('stoneMinerCost').textContent)
                    },
                    ironMiner: {
                        level: parseInt(document.getElementById('ironMinerLevel').textContent),
                        production: parseFloat(document.getElementById('ironMinerProduction').textContent),
                        cost: parseInt(document.getElementById('ironMinerCost').textContent)
                    }
                },
                currentDifficulty: currentDifficulty,
                xpRequired: xpRequired
            }
        };

        localStorage.setItem(`gameSlot_${slotNumber}`, JSON.stringify(saveData));
        document.getElementById(`saveTime${slotNumber}`).textContent = `Son kayıt: ${saveData.timestamp}`;
        showSuccessMessage('Oyun kaydedildi!');
    } catch (error) {
        console.error('Kayıt hatası:', error);
        showErrorMessage('Kayıt yapılırken bir hata oluştu!');
    }
}

// Oyun verilerini yükleme fonksiyonu
function loadFromSlot(slotNumber) {
    try {
        const savedData = localStorage.getItem(`gameSlot_${slotNumber}`);
        if (!savedData) {
            showErrorMessage('Kayıtlı oyun bulunamadı!');
            return;
        }

        const saveData = JSON.parse(savedData);
        const gameData = saveData.gameData;

        // Temel değerleri yükle
        gold = gameData.gold;
        wood = gameData.wood;
        stone = gameData.stone;
        iron = gameData.iron;
        clickPoints = gameData.clickPoints;
        clickPower = gameData.clickPower;
        playerLevel = gameData.playerLevel;
        playerXP = gameData.playerXP;
        currentDifficulty = gameData.currentDifficulty;
        xpRequired = gameData.xpRequired;

        // Üreticileri yükle
        const producers = gameData.producers;
        
        // Gold Miner
        document.getElementById('goldMinerLevel').textContent = producers.goldMiner.level;
        document.getElementById('goldMinerProduction').textContent = producers.goldMiner.production;
        document.getElementById('goldMinerCost').textContent = calculateGoldMinerCost();
        
        // Woodcutter
        document.getElementById('woodcutterLevel').textContent = producers.woodcutter.level;
        document.getElementById('woodcutterProduction').textContent = producers.woodcutter.production;
        document.getElementById('woodcutterCost').textContent = calculateWoodcutterCost();
        
        // Stone Miner
        document.getElementById('stoneMinerLevel').textContent = producers.stoneMiner.level;
        document.getElementById('stoneMinerProduction').textContent = producers.stoneMiner.production;
        document.getElementById('stoneMinerCost').textContent = calculateStoneMinerCost();
        
        // Iron Miner
        document.getElementById('ironMinerLevel').textContent = producers.ironMiner.level;
        document.getElementById('ironMinerProduction').textContent = producers.ironMiner.production;
        document.getElementById('ironMinerCost').textContent = calculateIronMinerCost();

        // Ekranı güncelle
        updateDisplay();
        updateXPBar();
        updateDifficultyDisplay();
        
        showSuccessMessage('Oyun yüklendi!');
    } catch (error) {
        console.error('Yükleme hatası:', error);
        showErrorMessage('Oyun yüklenirken bir hata oluştu!');
    }
}

// Kayıt silme fonksiyonu
function deleteSlot(slotNumber) {
    try {
        if (confirm('Bu kayıt silinecek. Emin misiniz?')) {
            localStorage.removeItem(`gameSlot_${slotNumber}`);
            document.getElementById(`saveTime${slotNumber}`).textContent = 'Son kayıt: -';
            showSuccessMessage('Kayıt silindi!');
        }
    } catch (error) {
        console.error('Silme hatası:', error);
        showErrorMessage('Kayıt silinirken bir hata oluştu!');
    }
}

// Sayfa yüklendiğinde kayıt zamanlarını kontrol et
document.addEventListener('DOMContentLoaded', () => {
    try {
        const savedData = localStorage.getItem('gameSlot_1');
        if (savedData) {
            const saveInfo = JSON.parse(savedData);
            document.getElementById('saveTime1').textContent = `Son kayıt: ${saveInfo.timestamp}`;
        }
    } catch (error) {
        console.error('Kayıt zamanı yükleme hatası:', error);
    }
});


