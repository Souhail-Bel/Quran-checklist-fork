const TOTAL_SURAH = 114;
const TOTAL_AYATS = 6236;

const container = document.getElementById("list");
const countText = document.getElementById("count");
const progressBar = document.getElementById("progressBar");
const percentText = document.getElementById("percent");

let saved_per_surah =
  JSON.parse(localStorage.getItem("progressPerSurah")) ||
  Array(TOTAL_SURAH).fill(0);

// references to DOM elements for applyRemoteState
const surahElems = [];

// the isLocalChange prevents a "Hot Potato" situation between clients
function updateProgress(isLocalChange = true) {
  localStorage.setItem("progressPerSurah", JSON.stringify(saved_per_surah));

  const totalMemAyats = saved_per_surah.reduce((sum, val) => sum + val, 0);
  countText.textContent = totalMemAyats;
  progressBar.value = totalMemAyats;

  const percentage = ((totalMemAyats / TOTAL_AYATS) * 100).toFixed(1);
  percentText.textContent = `(${percentage}%)`;

  if (isLocalChange) pushState(saved_per_surah); // Sync
}

QURAN_REG.forEach((surah, index) => {
  const div = document.createElement("div");
  const checkbox = document.createElement("input");
  const label = document.createElement("label");
  const surahProgress = document.createElement("progress");
  const span = document.createElement("span");
  const ayatInput = document.createElement("input");

  div.className = "surah";
  checkbox.type = "checkbox";
  label.textContent = index + 1 + ". " + sanitizeText(surah.name);
  span.className = "done";

  ayatInput.type = "number";
  ayatInput.className = "ayat-input";
  ayatInput.min = 0;
  ayatInput.max = surah.numberOfAyahs;
  ayatInput.value = saved_per_surah[index];

  // for accessibility
  checkbox.id = "surah-" + index;
  label.setAttribute("for", "surah-" + index);

  surahProgress.className = "surahProgress";
  surahProgress.max = surah.numberOfAyahs;
  surahProgress.value = saved_per_surah[index];

  if (saved_per_surah[index] === surah.numberOfAyahs) {
    checkbox.checked = true;
    surahProgress.hidden = true;
    span.textContent = " 🤲 تم الحفظ";
    saved_per_surah[index] = surah.numberOfAyahs;
  }

  // Store references for applyRemoteState
  surahElems[index] = { checkbox, surahProgress, span, ayatInput };

  ayatInput.addEventListener("input", function () {
    let val = parseInt(this.value) || 0;

    // clamp
    if (val < 0) val = 0;
    if (val > surah.numberOfAyahs) val = surah.numberOfAyahs;

    this.value = val;
    saved_per_surah[index] = val;
    surahProgress.value = val;

    if (val == surah.numberOfAyahs) {
      checkbox.checked = true;
      surahProgress.hidden = true;
      span.textContent = " 🤲 تم الحفظ";
    } else {
      checkbox.checked = false;
      surahProgress.hidden = false;
      span.textContent = "";
    }

    updateProgress();
  });

  checkbox.addEventListener("change", function () {
    if (this.checked) {
      surahProgress.hidden = true;
      span.textContent = " 🤲 تم الحفظ";

      saved_per_surah[index] = surah.numberOfAyahs;
      ayatInput.value = surah.numberOfAyahs;
    } else {
      surahProgress.hidden = false;
      span.textContent = "";
      saved_per_surah[index] = 0;
      ayatInput.value = 0;
    }

    surahProgress.value = ayatInput.value;

    updateProgress();
  });

  div.appendChild(checkbox);
  div.appendChild(label);
  div.appendChild(surahProgress);

  div.appendChild(ayatInput);
  const totalAyatLabel = document.createElement("span");
  totalAyatLabel.textContent = " / " + surah.numberOfAyahs;
  div.appendChild(totalAyatLabel);
  div.appendChild(span);

  container.appendChild(div);
});

// when remote state arrives via WebSocket
function applyRemoteState(remoteArray) {
  remoteArray.forEach((val, index) => {
    if (val === saved_per_surah[index]) return;

    const surah = QURAN_REG[index];
    const { checkbox, surahProgress, span, ayatInput } = surahElems[index];

    saved_per_surah[index] = val;
    ayatInput.value = val;
    surahProgress.value = val;

    if (val === surah.numberOfAyahs) {
      checkbox.checked = true;
      surahProgress.hidden = true;
      span.textContent = " 🤲 تم الحفظ";
    } else {
      checkbox.checked = false;
      surahProgress.hidden = false;
      span.textContent = "";
    }
  });

  updateProgress(false);
}

updateProgress(false); // We still didn't connect :(
