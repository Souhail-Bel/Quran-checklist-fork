// async function getSurahs() {
//   try {
//     const response = await fetch("https://api.alquran.cloud/v1/surah");
//     const result = await response.json();
//
//     if (result.code == 200) {
//       const surahs = result.data.map((surah) => ({
//         name: surah.name,
//         verses: surah.numberOfAyahs,
//       }));
//       console.table(surahs);
//       return surahs;
//     } else {
//       console.error("Server replied with code " + result.code);
//     }
//   } catch (err) {
//     console.erreror("Error loading: " + err);
//   }
// }
// surahs_promise = getSurahs();

const TOTAL_SURAH = 114;
const TOTAL_AYATS = 6236;

const container = document.getElementById("list");
const countText = document.getElementById("count");
const progressBar = document.getElementById("progressBar");

let saved = localStorage.getItem("progress") || "0".repeat(TOTAL_SURAH);

let saved_per_surah =
  JSON.parse(localStorage.getItem("progressPerSurah")) ||
  Array(TOTAL_SURAH).fill(0);

let checkedCount = 0;

function updateProgress() {
  countText.textContent = checkedCount;
  progressBar.value = checkedCount;
}

QURAN_REG.forEach((surah, index) => {
  const div = document.createElement("div");
  const checkbox = document.createElement("input");
  const label = document.createElement("label");
  const surahProgress = document.createElement("progress");
  const span = document.createElement("span");

  div.className = "surah";
  checkbox.type = "checkbox";
  label.textContent = index + 1 + ". " + sanitizeText(surah.name);
  span.className = "done";

  surahProgress.className = "surahProgress";
  surahProgress.max = surah.numberOfAyahs;
  surahProgress.value = saved_per_surah[index];

  if (saved[index] === "1") {
    checkbox.checked = true;
    surahProgress.hidden = true;
    span.textContent = " 🤲 تمت القراءة";
    saved_per_surah[index] = surah.numberOfAyahs;
    checkedCount++;
  }

  checkbox.addEventListener("change", function () {
    let arr = saved.split("");

    if (this.checked) {
      surahProgress.hidden = true;
      span.textContent = " 🤲 تمت القراءة";
      arr[index] = "1";
      saved_per_surah[index] = surah.numberOfAyahs;
      checkedCount++;
    } else {
      surahProgress.hidden = false;
      span.textContent = "";
      arr[index] = "0";
      saved_per_surah[index] = 0;
      checkedCount--;
    }

    saved = arr.join("");
    localStorage.setItem("progress", saved);
    localStorage.setItem("progressPerSurah", JSON.stringify(saved_per_surah));
    updateProgress();
  });

  div.appendChild(checkbox);
  div.appendChild(label);
  div.appendChild(surahProgress);
  div.appendChild(span);
  container.appendChild(div);
});

updateProgress();
