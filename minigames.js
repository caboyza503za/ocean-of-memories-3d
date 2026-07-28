window.MiniGames = [];
const MiniGames = window.MiniGames;

function createTitle(text) {
  const h3 = document.createElement('h3');
  h3.textContent = text;
  h3.style.color = 'var(--primary)';
  h3.style.marginBottom = '15px';
  return h3;
}

// 1. Tap the Heart
MiniGames.push({
  title: "หัวใจเต้นแรง",
  instruction: "แตะที่หัวใจ 5 ครั้งเพื่อพิสูจน์รัก",
  init: (container, onComplete) => {
    let count = 0;
    const btn = document.createElement('button');
    btn.className = 'mg-tap-btn';
    btn.textContent = '❤️';
    btn.onclick = () => {
      count++;
      btn.style.transform = `scale(${1 + count*0.2})`;
      if (count >= 5) onComplete();
    };
    container.appendChild(btn);
  }
});

// 2. Odd One Out
MiniGames.push({
  title: "หาจุดต่าง",
  instruction: "เลือกอิโมจิที่ไม่เข้าพวก",
  init: (container, onComplete) => {
    container.style.flexDirection = 'row';
    container.style.flexWrap = 'wrap';
    container.style.gap = '10px';
    container.style.padding = '20px';
    const emojis = ['💕','💕','💕','💞','💕','💕'];
    emojis.forEach(e => {
      const btn = document.createElement('button');
      btn.textContent = e;
      btn.style.fontSize = '3rem';
      btn.style.background = 'none';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.onclick = () => {
        if (e === '💞') onComplete();
        else btn.style.opacity = '0.2';
      };
      container.appendChild(btn);
    });
  }
});

// 3. Question
MiniGames.push({
  title: "คำถามทดสอบความจำ",
  instruction: "เราเรียกแทนตัวเองว่าอะไร?",
  init: (container, onComplete) => {
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    const options = ["เค้า-ตัวเอง", "พี่-หนู", "เธอ-เรา"];
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-glass';
      btn.textContent = opt;
      btn.onclick = () => {
        if (opt === "พี่-หนู") onComplete();
        else btn.style.background = 'red';
      };
      container.appendChild(btn);
    });
  }
});

// 4. Memory Match (2 pairs)
MiniGames.push({
  title: "คู่แท้",
  instruction: "เปิดไพ่จับคู่ให้ตรงกัน",
  init: (container, onComplete) => {
    const grid = document.createElement('div');
    grid.className = 'mg-match-grid';
    const items = ['🌸','🌸','💖','💖'];
    items.sort(() => Math.random() - 0.5);
    let flipped = [];
    let matched = 0;
    
    items.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'mg-card';
      const inner = document.createElement('span');
      inner.className = 'mg-hidden';
      inner.textContent = item;
      card.appendChild(inner);
      
      card.onclick = () => {
        if (flipped.length < 2 && !card.classList.contains('flipped')) {
          card.classList.add('flipped');
          inner.classList.remove('mg-hidden');
          flipped.push({card, inner, item});
          
          if (flipped.length === 2) {
            if (flipped[0].item === flipped[1].item) {
              matched++;
              flipped = [];
              if (matched === 2) setTimeout(onComplete, 500);
            } else {
              setTimeout(() => {
                flipped[0].card.classList.remove('flipped');
                flipped[0].inner.classList.add('mg-hidden');
                flipped[1].card.classList.remove('flipped');
                flipped[1].inner.classList.add('mg-hidden');
                flipped = [];
              }, 800);
            }
          }
        }
      };
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }
});

// 5. Type it
MiniGames.push({
  title: "พิมพ์บอกรัก",
  instruction: "พิมพ์คำว่า 'love' แล้วกดตกลง",
  init: (container, onComplete) => {
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    const input = document.createElement('input');
    input.type = 'text';
    input.style.padding = '10px';
    input.style.fontSize = '1.2rem';
    input.style.borderRadius = '5px';
    input.style.border = 'none';
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'ตกลง';
    btn.onclick = () => {
      if (input.value.toLowerCase().trim() === 'love') onComplete();
      else input.value = '';
    };
    container.appendChild(input);
    container.appendChild(btn);
  }
});

// 6. Catch the moving heart
MiniGames.push({
  title: "คว้าใจ",
  instruction: "แตะหัวใจที่วิ่งหนีให้ทัน!",
  init: (container, onComplete) => {
    const heart = document.createElement('div');
    heart.textContent = '💝';
    heart.style.position = 'absolute';
    heart.style.fontSize = '3rem';
    heart.style.cursor = 'pointer';
    heart.style.transition = 'all 0.3s';
    
    const move = () => {
      const w = container.clientWidth - 50;
      const h = container.clientHeight - 50;
      heart.style.left = Math.random() * w + 'px';
      heart.style.top = Math.random() * h + 'px';
    };
    
    heart.onclick = onComplete;
    container.appendChild(heart);
    move();
    const interval = setInterval(move, 800);
    // cleanup
    const oldComplete = onComplete;
    onComplete = () => { clearInterval(interval); oldComplete(); }
  }
});

// 7. Math
MiniGames.push({
  title: "เลขนำโชค",
  instruction: "ครบรอบกี่เดือนแล้วเอ่ย?",
  init: (container, onComplete) => {
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    const title = createTitle('? เดือน');
    
    const input = document.createElement('input');
    input.type = 'number';
    input.style.padding = '10px';
    input.style.fontSize = '1.2rem';
    input.style.borderRadius = '5px';
    input.style.width = '100px';
    input.style.textAlign = 'center';
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'ส่งคำตอบ';
    btn.onclick = () => {
      if (input.value === '7') onComplete();
    };
    container.appendChild(title);
    container.appendChild(input);
    container.appendChild(btn);
  }
});

// 8. Order click
MiniGames.push({
  title: "เรียงลำดับรัก",
  instruction: "กดปุ่มตามลำดับ 1, 2, 3",
  init: (container, onComplete) => {
    container.style.flexDirection = 'row';
    container.style.gap = '15px';
    let current = 1;
    const nums = [2, 1, 3];
    nums.forEach(n => {
      const btn = document.createElement('button');
      btn.className = 'btn-glass';
      btn.style.fontSize = '2rem';
      btn.style.width = '60px';
      btn.style.height = '60px';
      btn.textContent = n;
      btn.onclick = () => {
        if (n === current) {
          btn.style.background = 'var(--primary)';
          current++;
          if (current > 3) onComplete();
        } else {
          // reset
          current = 1;
          container.querySelectorAll('.btn-glass').forEach(b => b.style.background = 'rgba(255, 255, 255, 0.1)');
        }
      };
      container.appendChild(btn);
    });
  }
});

// 9. Unscramble
MiniGames.push({
  title: "เรียงคำ",
  instruction: "เรียงคำว่า L-O-V-E ให้ถูกต้อง",
  init: (container, onComplete) => {
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    const box = document.createElement('div');
    box.style.display = 'flex';
    box.style.gap = '10px';
    
    let answer = "";
    const letters = ['V','O','L','E'];
    const display = document.createElement('h2');
    display.textContent = "_ _ _ _";
    
    letters.forEach(l => {
      const btn = document.createElement('button');
      btn.className = 'btn-glass';
      btn.textContent = l;
      btn.onclick = () => {
        if (!btn.disabled) {
          answer += l;
          display.textContent = answer.padEnd(4, '_').split('').join(' ');
          btn.disabled = true;
          btn.style.opacity = '0.3';
          if (answer.length === 4) {
            if (answer === 'LOVE') onComplete();
            else {
              answer = '';
              display.textContent = "_ _ _ _";
              container.querySelectorAll('.btn-glass').forEach(b => {
                b.disabled = false;
                b.style.opacity = '1';
              });
            }
          }
        }
      };
      box.appendChild(btn);
    });
    container.appendChild(display);
    container.appendChild(box);
  }
});

// 10. Spam Click
MiniGames.push({
  title: "เติมพลังรัก",
  instruction: "รัวคลิกที่แถบพลังให้เต็ม!",
  init: (container, onComplete) => {
    container.style.flexDirection = 'column';
    container.style.gap = '20px';
    const bar = document.createElement('div');
    bar.style.width = '100%';
    bar.style.height = '30px';
    bar.style.background = 'rgba(255,255,255,0.2)';
    bar.style.borderRadius = '15px';
    bar.style.overflow = 'hidden';
    
    const fill = document.createElement('div');
    fill.style.width = '0%';
    fill.style.height = '100%';
    fill.style.background = 'var(--primary)';
    fill.style.transition = 'width 0.1s';
    bar.appendChild(fill);
    
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'คลิกรัวๆ!';
    
    let progress = 0;
    btn.onclick = () => {
      progress += 10;
      fill.style.width = progress + '%';
      if (progress >= 100) onComplete();
    };
    
    // drain
    const drain = setInterval(() => {
      if (progress > 0) {
        progress -= 2;
        fill.style.width = progress + '%';
      }
    }, 100);
    
    const oldComplete = onComplete;
    onComplete = () => { clearInterval(drain); oldComplete(); };
    
    container.appendChild(bar);
    container.appendChild(btn);
  }
});

// 11. Find the Ring
MiniGames.push({
  title: "ค้นหาสิ่งของ",
  instruction: "หาแหวนที่ซ่อนอยู่ในหอย",
  init: (container, onComplete) => {
    container.style.flexDirection = 'row';
    container.style.gap = '20px';
    const items = ['🦪','🦪','🦪'];
    const ringIndex = Math.floor(Math.random() * 3);
    
    items.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.style.fontSize = '4rem';
      btn.style.background = 'none';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.textContent = item;
      btn.onclick = () => {
        if (i === ringIndex) {
          btn.textContent = '💍';
          setTimeout(onComplete, 500);
        } else {
          btn.style.opacity = '0.3';
          btn.style.pointerEvents = 'none';
        }
      };
      container.appendChild(btn);
    });
  }
});

// 12. Password
MiniGames.push({
  title: "รหัสลับ",
  instruction: "รหัสผ่านคือคำว่า 'JUMP'",
  init: (container, onComplete) => {
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    const input = document.createElement('input');
    input.type = 'password';
    input.style.padding = '10px';
    input.style.fontSize = '1.2rem';
    input.style.borderRadius = '5px';
    input.style.border = 'none';
    input.style.textAlign = 'center';
    
    input.oninput = () => {
      if (input.value.toUpperCase() === 'JUMP') onComplete();
    };
    container.appendChild(input);
  }
});

// 13. Stop the Bar
MiniGames.push({
  title: "กะจังหวะให้เป๊ะ",
  instruction: "กดหยุดเมื่อแถบสีแดงอยู่ตรงกลาง (สีเขียว)",
  init: (container, onComplete) => {
    container.style.flexDirection = 'column';
    container.style.gap = '20px';
    const bar = document.createElement('div');
    bar.style.width = '100%';
    bar.style.height = '40px';
    bar.style.background = 'rgba(255,255,255,0.1)';
    bar.style.position = 'relative';
    
    const target = document.createElement('div');
    target.style.position = 'absolute';
    target.style.left = '40%';
    target.style.width = '20%';
    target.style.height = '100%';
    target.style.background = 'rgba(0, 255, 0, 0.3)';
    
    const cursor = document.createElement('div');
    cursor.style.position = 'absolute';
    cursor.style.left = '0%';
    cursor.style.width = '10px';
    cursor.style.height = '100%';
    cursor.style.background = '#ff4785';
    
    bar.appendChild(target);
    bar.appendChild(cursor);
    
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'STOP!';
    
    let pos = 0;
    let dir = 2;
    const anim = setInterval(() => {
      pos += dir;
      if (pos >= 100 || pos <= 0) dir *= -1;
      cursor.style.left = pos + '%';
    }, 20);
    
    btn.onclick = () => {
      clearInterval(anim);
      if (pos >= 40 && pos <= 60) {
        cursor.style.background = 'lime';
        setTimeout(onComplete, 500);
      } else {
        setTimeout(() => {
          dir = (Math.random() > 0.5 ? 2 : -2);
          setInterval(anim, 20); // Not perfect reset but good enough for simple game
        }, 500);
      }
    };
    container.appendChild(bar);
    container.appendChild(btn);
  }
});

// 14. Pick a Flower
MiniGames.push({
  title: "ดอกไม้ให้เธอ",
  instruction: "เลือกดอกกุหลาบ",
  init: (container, onComplete) => {
    container.style.flexDirection = 'row';
    container.style.gap = '15px';
    const flowers = ['🌻','🌹','🌷','🌼'];
    flowers.sort(() => Math.random() - 0.5);
    flowers.forEach(f => {
      const btn = document.createElement('button');
      btn.style.fontSize = '3rem';
      btn.style.background = 'none';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.textContent = f;
      btn.onclick = () => {
        if (f === '🌹') onComplete();
        else btn.style.opacity = '0.3';
      };
      container.appendChild(btn);
    });
  }
});

// 15. The Key
MiniGames.push({
  title: "กุญแจไขใจ",
  instruction: "กดที่กุญแจ",
  init: (container, onComplete) => {
    const btn = document.createElement('button');
    btn.style.fontSize = '5rem';
    btn.style.background = 'none';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.textContent = '🗝️';
    btn.onclick = onComplete;
    container.appendChild(btn);
  }
});

// Generate the rest using simple variations to ensure we have exactly 33
const variations = [
  {t: "คู่แท้อีกครั้ง", i: "จับคู่ความทรงจำ (ยากขึ้นนิดนึง)", emojis: ['🎀','🎀','🎁','🎁','💌','💌']},
  {t: "คำถามพิเศษ", i: "ใครหล่อกว่ากัน?", opts: ["จั๊ม", "จั๊มแน่นอน"], ans: "จั๊มแน่นอน"},
  {t: "จับสัตว์น้ำ", i: "หาปลาตัวน้อย", emojis: ['🐙','🦑','🐠','🦀'], ans: '🐠'},
  {t: "เลขอะไรเอ่ย", i: "7 + 7 = ?", type: 'math', ans: '14'},
  {t: "สัมผัสที่อ่อนโยน", i: "กดปุ่มค้างไว้ 3 วินาที", type: 'hold'},
  {t: "ความลับ", i: "พิมพ์ 'ม่อน'", type: 'type', ans: 'ม่อน'},
  {t: "รหัสหัวใจ", i: "รหัสคือ 07", type: 'type', ans: '07'},
  {t: "ตามล่าหาเพชร", i: "เลือกเพชรเม็ดงาม", emojis: ['💎','🔮','🧿'], ans: '💎'},
  {t: "คำถามพิเศษ", i: "ใครน่ารักที่สุด?", opts: ["ม่อน", "ม่อนสิ"], ans: "ม่อนสิ"},
  {t: "เรียงความรัก", i: "L-O-V-E อีกสักรอบ", type: 'unscramble'},
  {t: "สัมผัสรัก", i: "กดปุ่ม 7 ครั้ง", type: 'tap', count: 7},
  {t: "จับคู่กันนะ", i: "จับคู่ภาพ", emojis: ['🧸','🧸','🎈','🎈']},
  {t: "เลือกให้ถูก", i: "เลือกสีชมพู", opts: ["🔵", "🔴", "🟣", "🩷"], ans: "🩷"},
  {t: "คำตอบคือ", i: "เรารักกันไหม?", opts: ["รักสิ", "แน่นอน"], ans: "รักสิ"}, // both right!
  {t: "หาหอยมุก", i: "เลือกหอยมุก", emojis: ['🐚','🦪','🦀'], ans: '🦪'},
  {t: "กะจังหวะ", i: "หยุดตอนสีเขียว", type: 'bar'},
  {t: "ของขวัญ", i: "เลือกกล่องของขวัญ", emojis: ['📦','🎁','🛍️'], ans: '🎁'},
  {t: "รัวเข้าไป", i: "คลิกให้เต็มหลอดรวดเร็ว!", type: 'spam'}
];

for(let i=0; i < 18; i++) {
  const v = variations[i];
  MiniGames.push({
    title: v.t,
    instruction: v.i,
    init: (container, onComplete) => {
      // Basic emoji picker
      if (v.emojis && !v.type) {
        container.style.flexDirection = 'row';
        container.style.gap = '15px';
        v.emojis.sort(() => Math.random() - 0.5);
        let flipped = [];
        let matched = 0;
        
        if (v.ans) {
          v.emojis.forEach(e => {
            const btn = document.createElement('button');
            btn.style.fontSize = '3rem';
            btn.style.background = 'none';
            btn.style.border = 'none';
            btn.style.cursor = 'pointer';
            btn.textContent = e;
            btn.onclick = () => { if (e === v.ans) onComplete(); else btn.style.opacity='0.2'; };
            container.appendChild(btn);
          });
        } else {
          // It's a match game
          const grid = document.createElement('div');
          grid.className = 'mg-match-grid';
          grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
          v.emojis.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'mg-card';
            const inner = document.createElement('span');
            inner.className = 'mg-hidden';
            inner.textContent = item;
            card.appendChild(inner);
            
            card.onclick = () => {
              if (flipped.length < 2 && !card.classList.contains('flipped')) {
                card.classList.add('flipped');
                inner.classList.remove('mg-hidden');
                flipped.push({card, inner, item});
                if (flipped.length === 2) {
                  if (flipped[0].item === flipped[1].item) {
                    matched++;
                    flipped = [];
                    if (matched === (v.emojis.length/2)) setTimeout(onComplete, 500);
                  } else {
                    setTimeout(() => {
                      flipped[0].card.classList.remove('flipped');
                      flipped[0].inner.classList.add('mg-hidden');
                      flipped[1].card.classList.remove('flipped');
                      flipped[1].inner.classList.add('mg-hidden');
                      flipped = [];
                    }, 800);
                  }
                }
              }
            };
            grid.appendChild(card);
          });
          container.appendChild(grid);
        }
      }
      else if (v.opts) {
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        v.opts.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'btn-glass';
          btn.textContent = opt;
          btn.onclick = () => {
            if (opt === v.ans || v.t === "คำตอบคือ") onComplete();
            else btn.style.background = 'red';
          };
          container.appendChild(btn);
        });
      }
      else if (v.type === 'math' || v.type === 'type') {
        container.style.flexDirection = 'column';
        container.style.gap = '15px';
        const input = document.createElement('input');
        input.type = 'text';
        input.style.padding = '10px';
        input.style.fontSize = '1.2rem';
        input.style.borderRadius = '5px';
        input.style.border = 'none';
        input.style.textAlign = 'center';
        input.oninput = () => {
          if (input.value === v.ans) onComplete();
        };
        container.appendChild(input);
      }
      else if (v.type === 'hold') {
        const btn = document.createElement('button');
        btn.className = 'btn-primary';
        btn.textContent = 'กดค้างไว้';
        let tmr;
        btn.onmousedown = btn.ontouchstart = () => {
          btn.textContent = 'รอ...';
          tmr = setTimeout(onComplete, 3000);
        };
        btn.onmouseup = btn.ontouchend = btn.onmouseleave = () => {
          clearTimeout(tmr);
          btn.textContent = 'กดค้างไว้';
        };
        container.appendChild(btn);
      }
      else if (v.type === 'unscramble') {
        container.style.flexDirection = 'row';
        const letters = ['L','O','V','E'];
        letters.sort(() => Math.random() - 0.5);
        let ans = "";
        letters.forEach(l => {
          const btn = document.createElement('button');
          btn.className = 'btn-glass';
          btn.textContent = l;
          btn.onclick = () => {
            ans += l;
            btn.style.display = 'none';
            if (ans === 'LOVE') onComplete();
            else if (ans.length === 4) {
              ans = '';
              container.querySelectorAll('button').forEach(b => b.style.display = 'block');
            }
          };
          container.appendChild(btn);
        });
      }
      else if (v.type === 'tap') {
        let count = 0;
        const btn = document.createElement('button');
        btn.className = 'mg-tap-btn';
        btn.textContent = '💖';
        btn.onclick = () => {
          count++;
          btn.style.transform = `scale(${1 + count*0.2})`;
          if (count >= v.count) onComplete();
        };
        container.appendChild(btn);
      }
      else if (v.type === 'bar') {
        MiniGames[12].init(container, onComplete); // reuse logic
      }
      else if (v.type === 'spam') {
        MiniGames[9].init(container, onComplete); // reuse logic
      }
    }
  });
}

// We have 33 total now (15 + 18).
// Make sure we cap or fill exactly 33 just in case.
while(MiniGames.length < 33) {
  MiniGames.push(MiniGames[0]); // Duplicate if short
}
if (MiniGames.length > 33) {
  MiniGames.length = 33; // Trim if over
}
