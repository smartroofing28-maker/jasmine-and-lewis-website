/* =========================================
   SUPABASE SETTINGS
========================================= */

const SUPABASE_URL = "https://mlvsixtepwmcvraukftz.supabase.co";

const SUPABASE_KEY = "sb_publishable_vO__lN6U1yNPDsdu0WC5wQ_0Q-3m_M4";

let supabaseClient = null;

if (SUPABASE_URL && SUPABASE_KEY) {
    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
}


/* =========================================
   PASSWORD
========================================= */

const PASSWORD = "0000";

function unlockSite() {

    const input =
        document.getElementById("passwordInput");

    const wrong =
        document.getElementById("wrongPassword");

    const lock =
        document.getElementById("lockScreen");

    const website =
        document.getElementById("website");

    const musicPlayer =
        document.getElementById("musicPlayer");

    if (input.value === PASSWORD) {

        wrong.textContent = "";

        lock.classList.add("unlocking");

        setTimeout(() => {

            website.classList.add("visible");

            musicPlayer.style.display = "flex";

            loadAllPhotos();

        }, 700);

    } else {

        wrong.textContent =
            "That's not the password 🌸";

        input.value = "";

        input.animate(
            [
                { transform: "translateX(0)" },
                { transform: "translateX(-8px)" },
                { transform: "translateX(8px)" },
                { transform: "translateX(0)" }
            ],
            {
                duration: 300
            }
        );
    }
}


/* Press Enter to unlock */

document
    .getElementById("passwordInput")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            unlockSite();
        }

    });


/* =========================================
   MUSIC
========================================= */

const music =
    document.getElementById("music");

const musicButton =
    document.getElementById("musicButton");

function toggleMusic() {

    if (music.paused) {

        music.play()
            .then(() => {
                musicButton.textContent = "❚❚";
            })
            .catch(() => {
                alert(
                    "Add your music file as assets/music.mp3 first."
                );
            });

    } else {

        music.pause();

        musicButton.textContent = "▶";
    }
}


/* =========================================
   SUPABASE UPLOAD
========================================= */

async function uploadPhotos(files, category, statusElement) {

    if (!supabaseClient) {

        statusElement.textContent =
            "Supabase hasn't been connected yet.";

        return;
    }

    if (!files.length) {
        return;
    }

    statusElement.textContent =
        "Uploading your pictures... 🌸";

    let successful = 0;

    for (const file of files) {

        if (!file.type.startsWith("image/")) {
            continue;
        }

        if (file.size > 5 * 1024 * 1024) {

            statusElement.textContent =
                "One or more pictures are larger than 5 MB.";

            continue;
        }

        const safeName =
            file.name
                .replace(/[^a-zA-Z0-9.-]/g, "-");

        const fileName =
            `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2)}-${safeName}`;

        const filePath =
            `${category}/${fileName}`;

        const { error } =
            await supabaseClient
                .storage
                .from("jasmine-photos")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false
                    }
                );

        if (error) {

            console.error(error);

            continue;
        }

        successful++;
    }

    if (successful > 0) {

        statusElement.textContent =
            `${successful} picture(s) uploaded successfully 🌸`;

        await loadAllPhotos();

    } else {

        statusElement.textContent =
            "The pictures couldn't be uploaded.";
    }
}


/* =========================================
   LOAD PHOTOS
========================================= */

async function loadPhotos(category, galleryId, emptyId) {

    if (!supabaseClient) {
        return;
    }

    const gallery =
        document.getElementById(galleryId);

    const empty =
        document.getElementById(emptyId);

    const { data, error } =
        await supabaseClient
            .storage
            .from("jasmine-photos")
            .list(category, {
                limit: 100,
                sortBy: {
                    column: "created_at",
                    order: "desc"
                }
            });

    if (error) {

        console.error(error);

        return;
    }

    if (!data || data.length === 0) {
        return;
    }

    empty.style.display = "none";

    data.forEach(file => {

        const {
            data: publicData
        } =
            supabaseClient
                .storage
                .from("jasmine-photos")
                .getPublicUrl(
                    `${category}/${file.name}`
                );

        if (!publicData.publicUrl) {
            return;
        }

        const image =
            document.createElement("img");

        image.src =
            publicData.publicUrl;

        image.className =
            "gallery-image";

        image.loading = "lazy";

        image.alt =
            "Jasmine memory";

        gallery.appendChild(image);
    });
}


/* =========================================
   LOAD EVERYTHING
========================================= */

async function loadAllPhotos() {

    if (!supabaseClient) {
        return;
    }

    /*
       Clear old dynamically loaded pictures
       before loading them again.
    */

    document
        .querySelectorAll(".gallery-image")
        .forEach(image => image.remove());

    await loadPhotos(
        "moments",
        "momentsGallery",
        "momentsEmpty"
    );

    await loadPhotos(
        "smile",
        "smileGallery",
        "smileEmpty"
    );
}


/* =========================================
   UPLOAD INPUTS
========================================= */

document
    .getElementById("momentsInput")
    .addEventListener("change", function() {

        uploadPhotos(
            this.files,
            "moments",
            document.getElementById("momentsStatus")
        );

    });


document
    .getElementById("smileInput")
    .addEventListener("change", function() {

        uploadPhotos(
            this.files,
            "smile",
            document.getElementById("smileStatus")
        );

    });


/* =========================================
   SCROLL ANIMATIONS
========================================= */

const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "visible"
                    );

                }

            });

        },
        {
            threshold: 0.15
        }
    );


document
    .querySelectorAll(".reveal")
    .forEach(element => {

        observer.observe(element);

    });