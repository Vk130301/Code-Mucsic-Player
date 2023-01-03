const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER '

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},  
    songs: [
        {
            name: 'Vì mẹ anh bắt chia tay',
            single: 'Karik, Miu Lê',
            path: './assets/music/song1.mp3',
            image: './assets/img/1.jpg'
        },
        {
            name: 'Thiêu Thân',
            single: 'Bray, Sofia',
            path: './assets/music/song2.mp3',
            image: './assets/img/2.jpg'
        },
        {
            name: 'Đào Nương',
            single: 'Hoàng Vương',
            path: './assets/music/song3.mp3',
            image: './assets/img/3.jpg'
        },
        {
            name: 'Hãy Trao Cho Anh',
            single: 'Sơn Tùng M-TP, Snoop Dogg',
            path: './assets/music/song4.mp3',
            image: './assets/img/4.jpg'
        },
        {
            name: 'Chờ Ngày Mưa Tan',
            single: 'Noo Phước Thịnh, Tonny Việt',
            path: './assets/music/song5.mp3',
            image: './assets/img/5.jpg'
        },
        {
            name: 'Cảm Ơn Vì Tất Cả',
            single: 'Anh Quân',
            path: './assets/music/song6.mp3',
            image: './assets/img/6.jpg'
        }
        
    ],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index= "${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.single}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong' , {
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        const _this = this
        const cdwidth =  cd.offsetWidth

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000, // 10 seconds
            iterations: Infinity   
        })
        cdThumbAnimate.pause()
        
        //Xử lý phóng to / thu nhỏ CD 
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdwidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0

            cd.style.opacity = newCdWidth/cdwidth
        }

        // Xử lý khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()

            } else {
                audio.play()
            }
        }

        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xử lý khi tua xong
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // Khi next song
        nextBtn.onclick = function() {
            if(_this.isRandom) {
              _this.playrandomSong()
            } else {
              _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev song
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playrandomSong()
              } else {
                _this.prevSong()
              }
              audio.play()
              _this.render()
              _this.scrollToActiveSong()
        }

        // Xử lý bật / tắt random
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active',  _this.isRandom )
        }

        // Xử lý lặp lại một song
        repeatBtn.onclick = function(e) {
          _this.isRepeat = !_this.isRepeat
          _this.setConfig('isRepeat', _this.isRepeat)
          repeatBtn.classList.toggle('active',  _this.isRepeat )
        }

        // Xử lý next/ repeat song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
              audio.play()
            } else {
              nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
          const songNode = e.target.closest('.song:not(.active)')

          if (songNode || e.target.closest('.option')) {
            // Xử lý khi click vào song
            if(songNode) {
              _this.currentIndex = Number(songNode.dataset.index)
              _this.loadCurrentSong()
              _this.render()
              audio.play()
            }
            // Xử lý khi click vào option
            if(e.target.closest('.option')){

            }
          }
        }

    },

    scrollToActiveSong: function() {
        setTimeout(() => {
          $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }, 300);
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function() {
      this.currentIndex++
      if(this.currentIndex >= this.songs.length) {
        this.currentIndex = 0
      }
      this.loadCurrentSong()
    },

    prevSong: function() {
      this.currentIndex--
      if(this.currentIndex < 0) {
        this.currentIndex = this.songs.length - 1
      }
      this.loadCurrentSong()
    },

    playrandomSong: function() {
      let newIndex
      do {
        newIndex = Math.floor(Math.random() * this.songs.length)
      } while (newIndex === this.currentIndex)
    
      this.currentIndex = newIndex
      this.loadCurrentSong()
    },

    start: function() {
        // Gắn cấu hình từ config vào ứng dụng
        this.loadConfig()

        // Định nghĩa các thuộc tính cho Object
        this.defineProperties()

        // Lắng nghe và xử lý các sự kiện(DOM events)
        this.handleEvents()

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render Playlist
        this.render()

        //Hiện thị trạng thái ban đầu của button random && repeat
        randomBtn.classList.toggle('active',  this.isRandom )
        repeatBtn.classList.toggle('active',  this.isRepeat )
    }
}

app.start()