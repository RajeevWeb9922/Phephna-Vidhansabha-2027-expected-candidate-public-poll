const SUPABASE_URL = "https://yzxsteytjdejiilzmogw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_w5LBaDPTppw80_2fUr1Zug_MPKcUtug";

const { createClient } = window.supabase;

let db = null;

try {
  if (!window.supabase) {
    throw new Error("Supabase library did not load.");
  }

  db = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
} catch (error) {
  console.error("Supabase setup error:", error);
}

const candidates = [
  {
    id: 1,
    name: "भारती सिंह",
    info: "पूर्व चेयरमैन जिला पंचायत बलिया — बसपा"
  },
  {
    id: 2,
    name: "बंश नारायण राय",
    info: "रिटायर्ड पी.सी.एस. — भाजपा"
  },
  {
    id: 3,
    name: "केशरी नन्द त्रिपाठी",
    info: "पूर्व चेयरमैन चितबड़ागांव नपा — बसपा"
  },
  {
    id: 4,
    name: "बंशीधर यादव",
    info: "ब्लॉक प्रमुख प्रतिनिधि सोहांव — सपा"
  },
  {
    id: 5,
    name: "उपेन्द्र तिवारी",
    info: "पूर्व मंत्री — भाजपा"
  },
  {
    id: 6,
    name: "अम्बिका चौधरी",
    info: "पूर्व मंत्री — सपा"
  },
  {
    id: 7,
    name: "डॉक्टर शुभा देवर",
    info: "पत्नी सांसद नीरज शेखर — भाजपा"
  },
  {
    id: 8,
    name: "समग्र/संग्राम सिंह यादव",
    info: "विधायक फेफना एवं पूर्व मंत्री — सपा"
  },
  {
    id: 9,
    name: "नारद राय",
    info: "पूर्व मंत्री — भाजपा"
  }
];

const pollList = document.getElementById("poll-list");
const resultsBox = document.getElementById("results");
const statusBox = document.getElementById("status");


function renderCandidates() {

  if (!pollList) return;

  pollList.innerHTML = candidates.map(candidate => `
    <div class="candidate-card">

      <div class="candidate-info">
        <h3>${candidate.name}</h3>
        <p>${candidate.info}</p>
      </div>

      <button onclick="vote(${candidate.id})">
        वोट करें
      </button>

    </div>
  `).join("");
}


async function loadResults() {

  if (!db) {
    if (statusBox) {
      statusBox.textContent =
        "Voting service से connection नहीं हो पाया।";
    }
    return;
  }

  try {

    const { data, error } = await db
      .from("poll_results")
      .select("candidate_id, votes")
      .order("candidate_id");

    if (error) {
      throw error;
    }

    const resultMap = new Map(
      (data || []).map(row => [
        Number(row.candidate_id),
        Number(row.votes || 0)
      ])
    );

    const rows = candidates.map(candidate => ({
      candidate,
      votes: resultMap.get(candidate.id) || 0
    }));

    const totalVotes = rows.reduce(
      (sum, row) => sum + row.votes,
      0
    );

    if (!resultsBox) return;

    resultsBox.innerHTML = rows.map(row => {

      const percent = totalVotes
        ? ((row.votes / totalVotes) * 100).toFixed(1)
        : "0.0";

      return `
        <div class="result-row">

          <div class="result-name">

            <strong>${row.candidate.name}</strong>

            <span>
              ${row.votes} वोट – ${percent}%
            </span>

          </div>

          <div class="bar">
            <div
              class="bar-fill"
              style="width:${percent}%">
            </div>
          </div>

        </div>
      `;

    }).join("");

    if (statusBox) {

      if (totalVotes === 0) {
        statusBox.textContent =
          "अभी कोई वोट दर्ज नहीं हुआ है।";
      } else {
        statusBox.textContent =
          "Live results • वोट अपने आप अपडेट होते रहेंगे";
      }

    }

  } catch (error) {

    console.error("Results error:", error);

    if (resultsBox) {
      resultsBox.innerHTML =
        "<p>Live results अभी उपलब्ध नहीं हैं।</p>";
    }

    if (statusBox) {
      statusBox.textContent =
        "उम्मीदवारों की सूची तैयार है। Live results service से connection नहीं हो पाया।";
    }

  }
}


async function getUserForVote() {

  if (!db) {
    throw new Error("Voting service is not connected.");
  }

  const {
    data: sessionData,
    error: sessionError
  } = await db.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (sessionData && sessionData.session) {
    return sessionData.session.user;
  }

  const {
    data,
    error
  } = await db.auth.signInAnonymously();

  if (error) {
    throw error;
  }

  return data.user;
}


async function vote(candidateId) {

  try {

    if (statusBox) {
      statusBox.textContent =
        "वोट दर्ज किया जा रहा है...";
    }

    const user = await getUserForVote();

    if (!user) {
      throw new Error("User session नहीं मिली।");
    }

    const { error } = await db
      .from("poll_votes")
      .insert({
        voter_id: user.id,
        candidate_id: candidateId
      });

    if (error) {

      if (error.code === "23505") {

        if (statusBox) {
          statusBox.textContent =
            "आप पहले ही वोट कर चुके हैं। एक व्यक्ति एक ही वोट दे सकता है।";
        }

        return;
      }

      throw error;
    }

    if (statusBox) {
      statusBox.textContent =
        "✅ आपका वोट सफलतापूर्वक दर्ज हो गया।";
    }

    await loadResults();

  } catch (error) {

    console.error("Vote error:", error);

    if (statusBox) {
      statusBox.textContent =
        "वोट दर्ज नहीं हो पाया। कृपया थोड़ी देर बाद फिर प्रयास करें।";
    }

  }
}


function setupShareButtons() {

  const shareButtons =
    document.querySelectorAll("[data-share]");

  shareButtons.forEach(button => {

    button.addEventListener("click", async () => {

      const type = button.getAttribute("data-share");

      const url = window.location.href;

      const text =
        "फेफना 360 जनता की पसंद 2027 — अपनी पसंद के उम्मीदवार को वोट करें।";

      if (type === "facebook") {

        const shareUrl =
          "https://www.facebook.com/sharer/sharer.php?u=" +
          encodeURIComponent(url);

        window.open(
          shareUrl,
          "_blank",
          "noopener,noreferrer"
        );

      } else if (type === "whatsapp") {

        const whatsappUrl =
          "https://wa.me/?text=" +
          encodeURIComponent(text + "\n" + url);

        window.open(
          whatsappUrl,
          "_blank",
          "noopener,noreferrer"
        );

      } else if (type === "copy") {

        try {

          await navigator.clipboard.writeText(url);

          if (statusBox) {
            statusBox.textContent =
              "✅ Link copy हो गया।";
          }

        } catch (error) {

          if (statusBox) {
            statusBox.textContent =
              "Link copy नहीं हो पाया।";
          }

        }

      }

    });

  });

}


function setupQR() {

  const qrBox =
    document.getElementById("qrcode");

  if (!qrBox) return;

  if (
    typeof QRCode === "undefined"
  ) {
    return;
  }

  qrBox.innerHTML = "";

  new QRCode(qrBox, {
    text: window.location.href,
    width: 180,
    height: 180
  });

}


function startPoll() {

  // सबसे पहले उम्मीदवार दिखाएँ
  // ताकि Supabase में कोई समस्या हो तो भी page खाली न रहे।

  renderCandidates();

  setupShareButtons();

  setupQR();

  if (statusBox) {
    statusBox.textContent =
      "उम्मीदवारों की सूची तैयार है।";
  }

  // Results अलग से load होंगे।
  loadResults();
}


window.vote = vote;

startPoll();

setInterval(
  loadResults,
  30000
);
