/**@type {Music[]}*/
let musicList = null;

const SPLIT_SYM = "&&&";
let currentIndex = 0;
const MUSIC_LIST_KEY = "31415";
/**@type{HTMLAudioElement} */
let audio = null;

class Music {
    constructor(name, url) {
        this.name = name;
        this.url = url;
    }

    name;
    url;
}



function onBodyLoad() {
    audio = new Audio();
    audio.onended = onTrackEnd;
    document.onkeydown = onkeydownOnPage;
    initAddBtn();
    initShuffleBtn();
    initRecycleBtn();
    initMusicListFromSaved();

}



function initRecycleBtn() {
    let recycleBtn = document.getElementById("recycle_btn");
    recycleBtn.onclick = function () {
        let alpha = Number(recycleBtn.style.opacity);

        console.log("alpha:" + alpha);
        if (alpha == 1) {
            recycleBtn.style.opacity = "0.3";
        } else {
            recycleBtn.style.opacity = "1";
        }
    }

}

function isRecycle() {
    return Number(document.getElementById("recycle_btn").style.opacity) == 1;
}



function initAddBtn() {

    document.getElementById("add_btn").onclick = function () {

        pickAudioFiles().then(function (/**@type{Music[]}*/list) {
            console.log(list);
            if (list != null) {

                initMusicFolderPathSetting(list[0].name).then(function (path) {
                    console.log(path);
                    if (path != null) {
                        list.forEach(music => {
                            music.url = path + music.name;
                        });
                        localStorage.setItem(MUSIC_LIST_KEY, JSON.stringify(list));
                        alert("Music list saved");

                    }/*  else {
                        alert("Path is uncorrect");

                    } */

                    setMusicList(list);
                    updatePlayList(-1);

                });

            }
        });
    };
}

//peek css

function initShuffleBtn() {
    document.getElementById("shuffle_btn").onclick = function () {
        let list = getMusicList();
        if (list != null) {
            let currentName = list[currentIndex].name;
            list.sort(function () {
                return Math.random() - 0.5;
            });
            //setMusicList(list);
            for (let i in list) {
                if (list[i].name == currentName) {
                    currentIndex = i;
                    break;
                }
            }
            updatePlayList(currentIndex);
        }
    };
}

function getMusicList() {
    if (musicList == null || musicList.length == 0) {
        return null;
    } else {
        return musicList;
    }
}

function setMusicList(list) {
    musicList = list;
}

function pickAudioFiles() {
    return new Promise(function (resolve) {
        let fileInput = document.getElementById("file_input");
        fileInput.value = null;
        fileInput.onchange = function () {
            fileInput.onchange = null;
            if (fileInput.files != null && fileInput.files.length > 0) {

                /**@type {Music[]} */
                let list = [];

                for (let file of fileInput.files) {
                    console.log(file);
                    list.push(
                        new Music(
                            file.name,
                            URL.createObjectURL(file)
                        )
                    );
                }
                resolve(list);
            } else {
                resolve(null);
            }
        };
        fileInput.click();
    });
}

/*function initBackgroundSettings() {
    document.getElementById("setting_btn").onclick = function () {

        let fileInput = document.getElementById('file_input');
        fileInput.accept = "*!/!*";
        fileInput.onchange = function (e) {
            let root = document.getElementById('root');
            root.style.background = `url(${URL.createObjectURL(fileInput.files[0])}) center/cover no-repeat`;
        };
        fileInput.click();
    };
}*/

function initMusicListFromSaved() {
    let ss = localStorage.getItem(MUSIC_LIST_KEY);
    console.log("initMusicListAsync:" + ss);
    if (ss != null) {
        let list = JSON.parse(ss);
        if (list != null) {
            setMusicList(list);
            updatePlayList(-1);
        }
    }
}


function initMusicFolderPathSetting(musicName) {
    return new Promise(function (resolve) {
        let path = prompt("Input music folder path");
        console.log(path);
        if (path != null && path != "") {
            if (!path.endsWith("/")) {
                path = path + "/";
            }

            isMusicFileExistsAsync(path + musicName).then(function (result) {
                if (result) {
                    resolve(path);
                } else {
                    resolve(null);
                }
            });
        } else {
            resolve(null);
        }
    })

}




function isMusicFileExistsAsync(path) {
    return new Promise(function (resolve, reject) {
        audio.oncanplaythrough = function (e) {
            audio.oncanplaythrough = null;
            resolve(true);
        };
        audio.src = path;
        setTimeout(function () {
            resolve(false);
        }, 500);
    });
}




function onkeydownOnPage(e) {
    console.log(e);

    if (getMusicList() == null) {
        return;
    }
    //e.preventDefault();
    let keyCode = e.code;
    if (keyCode == "ArrowLeft" || keyCode == "ArrowUp") {
        prevTrack();
        e.returnValue = false;
    } else if (keyCode == "ArrowRight" || keyCode == "ArrowDown") {
        nextTrack();
        e.returnValue = false;
    } else if (keyCode == "Space") {
        playPause();
        e.returnValue = false;
    }
}

function playPause() {
    console.log("play pause");
    if (getMusicList() == null) {
        return;
    }

    let time1 = audio.currentTime;
    console.log("time1:" + time1);
    setTimeout(function () {
        let time2 = audio.currentTime;
        console.log("time2:" + time2);

        if (time2 - time1 == 0) {
            console.log(audio.src);
            if (audio.src == null || audio.src == "") {
                currentIndex = 0;
                audio.src = getMusicList()[currentIndex].url;
            }
            audio.play();
        } else {
            audio.pause();
        }
    }, 100);
    updatePlayList(currentIndex);
}

function nextTrack() {
    if (getMusicList() == null) {
        return;
    }

    if (currentIndex < getMusicList().length - 1) {
        currentIndex++;
    } else {
        currentIndex = 0;
    }
    audio.src = getMusicList()[currentIndex].url;
    audio.play();
    updatePlayList(currentIndex);
}

function prevTrack() {
    if (getMusicList() == null) {
        return;
    }

    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = musicList.length - 1;
    }
    audio.src = getMusicList()[currentIndex].url;
    audio.play();
    updatePlayList(currentIndex);
}

function onTrackEnd() {
    if (isRecycle()) {
        currentIndex--;
    }
    nextTrack();
}


/**
 * 
 * @param {Number} playingId 
 * @returns 
 */

function updatePlayList(playingId) {
    if (getMusicList() == null) {
        return;
    }
    let list = document.getElementById("m_list");
    let scrollTop = 0;
    if (list != null) {
        scrollTop = list.scrollTop;
    }

    console.log("scrollTop:" + scrollTop);
    document.getElementById("music_list").innerHTML = getMusicListHtml(playingId);

    if (scrollTop > 0) {
        document.getElementById("m_list").scrollTo(0, scrollTop);
    }

    if (playingId >= 0 && getMusicList() != null) {
        let name = getMusicList()[playingId].name;
        name = name.substring(0, name.lastIndexOf("."));
        document.title = name;
    }
}


/**
 * 
 * @param {Number} index 
 * @returns 
 */

function onMusicItemClick(index) {
    if (getMusicList() == null) {
        return;
    }
    currentIndex = index;
    audio.src = getMusicList()[index].url;
    console.log(audio.src);
    audio.play();
    updatePlayList(index);
}

function getMusicListHtml(playingId) {

    if (getMusicList() == null) {
        return null;
    }

    let html = "<ul id='m_list'>";
    for (let i in getMusicList()) {
        let music = getMusicList()[i];
        let showName = music.name.substring(0, music.name.lastIndexOf("."))
        let background =
            i == playingId
                ? 'style ="background-color:#333;color:white;" id="playing_item"'
                : "";
        let li = `<li class="music_list_item" ${background} onclick="onMusicItemClick(${i});">${showName}</li>`;
        html += li;
    }
    html += "</ul>";

    return html;
}
