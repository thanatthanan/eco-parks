const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const ROOT_DIR = __dirname;

const thaiToEngProvince = {
    "กรุงเทพมหานคร": "Bangkok", "กระบี่": "Krabi", "กาญจนบุรี": "Kanchanaburi", "กาฬสินธุ์": "Kalasin",
    "กำแพงเพชร": "Kamphaeng Phet", "ขอนแก่น": "Khon Kaen", "จันทบุรี": "Chanthaburi", "ฉะเชิงเทรา": "Chachoengsao",
    "ชลบุรี": "Chon Buri", "ชัยนาท": "Chainat", "ชัยภูมิ": "Chaiyaphum", "ชุมพร": "Chumphon",
    "เชียงราย": "Chiang Rai", "เชียงใหม่": "Chiang Mai", "ตรัง": "Trang", "ตราด": "Trat",
    "ตาก": "Tak", "นครนายก": "Nakhon Nayok", "นครปฐม": "Nakhon Pathom", "นครพนม": "Nakhon Phanom",
    "นครราชสีมา": "Nakhon Ratchasima", "นครศรีธรรมราช": "Nakhon Si Thammarat", "นครสวรรค์": "Nakhon Sawan",
    "นนทบุรี": "Nonthaburi", "นราธิวาส": "Narathiwat", "น่าน": "Nan", "บึงกาฬ": "Bueng Kan",
    "บุรีรัมย์": "Buri Ram", "ปทุมธานี": "Pathum Thani", "ประจวบคีรีขันธ์": "Prachuap Khiri Khan",
    "ปราจีนบุรี": "Prachin Buri", "ปัตตานี": "Pattani", "พระนครศรีอยุธยา": "Phra Nakhon Si Ayutthaya",
    "พะเยา": "Phayao", "พังงา": "Phangnga", "พัทลุง": "Phatthalung", "พิจิตร": "Phichit",
    "พิษณุโลก": "Phitsanulok", "เพชรบุรี": "Phetchaburi", "เพชรบูรณ์": "Phetchabun", "แพร่": "Phrae",
    "ภูเก็ต": "Phuket", "มหาสารคาม": "Maha Sarakham", "มุกดาหาร": "Mukdahan", "แม่ฮ่องสอน": "Mae Hong Son",
    "ยโสธร": "Yasothon", "ยะลา": "Yala", "ร้อยเอ็ด": "Roi Et", "ระนอง": "Ranong",
    "ระยอง": "Rayong", "ราชบุรี": "Ratchaburi", "ลพบุรี": "Lop Buri", "ลำปาง": "Lampang",
    "ลำพูน": "Lamphun", "เลย": "Loei", "ศรีสะเกษ": "Si Sa Ket", "สกลนคร": "Sakon Nakhon",
    "สงขลา": "Songkhla", "สตูล": "Satun", "สมุทรปราการ": "Samut Prakan", "สมุทรสงคราม": "Samut Songkhram",
    "สมุทรสาคร": "Samut Sakhon", "สระแก้ว": "Sa Kaeo", "สระบุรี": "Saraburi", "สิงห์บุรี": "Sing Buri",
    "สุโขทัย": "Sukhothai", "สุพรรณบุรี": "Suphan Buri", "สุราษฎร์ธานี": "Surat Thani", "สุรินทร์": "Surin",
    "หนองคาย": "Nong Khai", "หนองบัวลำภู": "Nong Bua Lam Phu", "อ่างทอง": "Ang Thong", "อำนาจเจริญ": "Amnat Charoen",
    "อุดรธานี": "Udon Thani", "อุตรดิตถ์": "Uttaradit", "อุทัยธานี": "Uthai Thani", "อุบลราชธานี": "Ubon Ratchathani"
};

const provinceToRegion = {
    "เชียงใหม่": "ภาคเหนือ", "เชียงราย": "ภาคเหนือ", "พะเยา": "ภาคเหนือ", "แม่ฮ่องสอน": "ภาคเหนือ",
    "ลำปาง": "ภาคเหนือ", "ลำพูน": "ภาคเหนือ", "แพร่": "ภาคเหนือ", "น่าน": "ภาคเหนือ",
    "ตาก": "ภาคเหนือ", "กำแพงเพชร": "ภาคเหนือ", "สุโขทัย": "ภาคเหนือ", "พิษณุโลก": "ภาคเหนือ",
    "พิจิตร": "ภาคเหนือ", "นครสวรรค์": "ภาคเหนือ", "อุทัยธานี": "ภาคเหนือ", "อุตรดิตถ์": "ภาคเหนือ",
    "เพชรบูรณ์": "ภาคตะวันออกเฉียงเหนือ", "นครราชสีมา": "ภาคตะวันออกเฉียงเหนือ", "ชัยภูมิ": "ภาคตะวันออกเฉียงเหนือ", "สกลนคร": "ภาคตะวันออกเฉียงเหนือ",
    "มุกดาหาร": "ภาคตะวันออกเฉียงเหนือ", "อุบลราชธานี": "ภาคตะวันออกเฉียงเหนือ", "ศรีสะเกษ": "ภาคตะวันออกเฉียงเหนือ",
    "ขอนแก่น": "ภาคตะวันออกเฉียงเหนือ", "เลย": "ภาคตะวันออกเฉียงเหนือ", "หนองบัวลำภู": "ภาคตะวันออกเฉียงเหนือ",
    "อุดรธานี": "ภาคตะวันออกเฉียงเหนือ", "นครพนม": "ภาคตะวันออกเฉียงเหนือ", "กาฬสินธุ์": "ภาคตะวันออกเฉียงเหนือ",
    "บึงกาฬ": "ภาคตะวันออกเฉียงเหนือ", "มหาสารคาม": "ภาคตะวันออกเฉียงเหนือ", "ยโสธร": "ภาคตะวันออกเฉียงเหนือ",
    "ร้อยเอ็ด": "ภาคตะวันออกเฉียงเหนือ", "หนองคาย": "ภาคตะวันออกเฉียงเหนือ", "อำนาจเจริญ": "ภาคตะวันออกเฉียงเหนือ",
    "สุรินทร์": "ภาคตะวันออกเฉียงเหนือ", "บุรีรัมย์": "ภาคตะวันออกเฉียงเหนือ",
    "กาญจนบุรี": "ภาคกลางและภาคตะวันตก", "สระบุรี": "ภาคกลางและภาคตะวันตก", "สุพรรณบุรี": "ภาคกลางและภาคตะวันตก",
    "เพชรบุรี": "ภาคกลางและภาคตะวันตก", "ประจวบคีรีขันธ์": "ภาคกลางและภาคตะวันตก", "ราชบุรี": "ภาคกลางและภาคตะวันตก",
    "นครนายก": "ภาคกลางและภาคตะวันตก", "กรุงเทพมหานคร": "ภาคกลางและภาคตะวันตก", "นนทบุรี": "ภาคกลางและภาคตะวันตก",
    "ปทุมธานี": "ภาคกลางและภาคตะวันตก", "พระนครศรีอยุธยา": "ภาคกลางและภาคตะวันตก", "อ่างทอง": "ภาคกลางและภาคตะวันตก",
    "สิงห์บุรี": "ภาคกลางและภาคตะวันตก", "ชัยนาท": "ภาคกลางและภาคตะวันตก", "ลพบุรี": "ภาคกลางและภาคตะวันตก",
    "สมุทรปราการ": "ภาคกลางและภาคตะวันตก", "สมุทรสงคราม": "ภาคกลางและภาคตะวันตก", "สมุทรสาคร": "ภาคกลางและภาคตะวันตก",
    "ปราจีนบุรี": "ภาคตะวันออก", "สระแก้ว": "ภาคตะวันออก", "ฉะเชิงเทรา": "ภาคตะวันออก",
    "ชลบุรี": "ภาคตะวันออก", "ระยอง": "ภาคตะวันออก", "จันทบุรี": "ภาคตะวันออก", "ตราด": "ภาคตะวันออก",
    "สุราษฎร์ธานี": "ภาคใต้", "กระบี่": "ภาคใต้", "พังงา": "ภาคใต้", "นครศรีธรรมราช": "ภาคใต้",
    "ตรัง": "ภาคใต้", "สตูล": "ภาคใต้", "ยะลา": "ภาคใต้", "นราธิวาส": "ภาคใต้",
    "ปัตตานี": "ภาคใต้", "ภูเก็ต": "ภาคใต้", "ชุมพร": "ภาคใต้", "ระนอง": "ภาคใต้",
    "พัทลุง": "ภาคใต้", "สงขลา": "ภาคใต้"
};

function formatDates(rawDate) {
    const parts = rawDate.split('-');
    const yearBE = parseInt(parts[0]) + 543;
    const yearShort = yearBE.toString().substring(2);
    const day = parseInt(parts[2]);
    const monthIndex = parseInt(parts[1]) - 1;

    const shortMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const fullMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

    return {
        dateShort: `${day} ${shortMonths[monthIndex]} ${yearShort}`,
        dateFull: `${day} ${fullMonths[monthIndex]} ${yearBE}`,
        dateBE: `${parts[2]} / ${parts[1]} / ${yearBE}`
    };
}

function updateProjectFiles({ name, prov, dateRaw, act, gitPush }) {
    return new Promise((resolve, reject) => {
        try {
            const { dateShort, dateFull, dateBE } = formatDates(dateRaw);
            const cleanAct = act.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/g, '').trim();

            // 1. Update CHECKLIST.md
            const checklistPath = path.join(ROOT_DIR, 'CHECKLIST.md');
            let checklist = fs.readFileSync(checklistPath, 'utf8');
            const parkRegex = new RegExp(`- \\[ \\] \\*\\*${name}\\s*\\((.*?)\\)\\*\\*\\r?\\n\\s*- ครั้งที่ 1: วันที่ \\[\\s*\\/\\s*\\/\\s*\\] \\| กิจกรรม: \\[.*?\\]`);
            if (parkRegex.test(checklist)) {
                checklist = checklist.replace(parkRegex, `- [x] **${name} ($1)**\n    - ครั้งที่ 1: วันที่ [ ${dateBE} ] | กิจกรรม: [ ${cleanAct} ]`);
            } else {
                // If park line exists without unvisited template or not found
                const targetHeader = `## ${provinceToRegion[prov] || 'ภาคเหนือ'}`;
                const insertPattern = new RegExp(`(${targetHeader}[\\s\\S]*?)(\\r?\\n## |$)`);
                const newParkEntry = `\n- [x] **${name} (${prov})**\n    - ครั้งที่ 1: วันที่ [ ${dateBE} ] | กิจกรรม: [ ${cleanAct} ]\n`;
                if (checklist.includes(targetHeader)) {
                    checklist = checklist.replace(targetHeader, `${targetHeader}${newParkEntry}`);
                }
            }
            fs.writeFileSync(checklistPath, checklist, 'utf8');

            // 2. Update TRAVEL_DASHBOARD.md
            const dashMdPath = path.join(ROOT_DIR, 'TRAVEL_DASHBOARD.md');
            let dashMd = fs.readFileSync(dashMdPath, 'utf8');
            
            // Extract current count
            const countMatch = dashMd.match(/ความสำเร็จ:\*\* 🏆 \*\*(\d+) \/ 156\*\*/);
            const currentCount = countMatch ? parseInt(countMatch[1]) : 29;
            const newCount = currentCount + 1;
            const newPercent = ((newCount / 156) * 100).toFixed(1);

            dashMd = dashMd.replace(/ความสำเร็จ:\*\* 🏆 \*\*\d+ \/ 156\*\* แห่ง \(ประมาณ [\d\.]+%?\)/,
                `ความสำเร็จ:** 🏆 **${newCount} / 156** แห่ง (ประมาณ ${newPercent}%)`);

            // Check province list
            const provMatch = dashMd.match(/จังหวัดที่ไปเยือน:\*\* (\d+) จังหวัด \((.*?)\)/);
            let provCount = provMatch ? parseInt(provMatch[1]) : 15;
            let provList = provMatch ? provMatch[2] : '';
            if (!provList.includes(prov)) {
                provCount++;
                provList = provList ? `${provList}, ${prov}` : prov;
                dashMd = dashMd.replace(/จังหวัดที่ไปเยือน:\*\* \d+ จังหวัด \(.*?\)/,
                    `จังหวัดที่ไปเยือน:** ${provCount} จังหวัด (${provList})`);
            }

            // Update latest trip
            dashMd = dashMd.replace(/ทริปล่าสุด:\*\* .*?\n/, `ทริปล่าสุด:** ${name} (${dateFull})\n`);

            // Add row to table
            const tableRowRegex = new RegExp(`(\\| ${currentCount} \\| .*?\\r?\\n)`);
            const newRow = `| ${newCount} | ${dateShort} | ${name} | ${prov} | ${act} |\n`;
            if (tableRowRegex.test(dashMd)) {
                dashMd = dashMd.replace(tableRowRegex, `$1${newRow}`);
            }

            // Update regional progress in markdown
            const region = provinceToRegion[prov] || 'ภาคเหนือ';
            const regRegex = new RegExp(`- \\*\\*${region}:\\*\\* (🟢*) \\((\\d+) แห่ง\\)`);
            const regMatch = dashMd.match(regRegex);
            if (regMatch) {
                const currentRegCount = parseInt(regMatch[2]);
                const newRegCount = currentRegCount + 1;
                const newCircles = regMatch[1] + '🟢';
                dashMd = dashMd.replace(regRegex, `- **${region}:** ${newCircles} (${newRegCount} แห่ง)`);
            }

            // Update footer date
            dashMd = dashMd.replace(/\*อัปเดตล่าสุดเมื่อ: .*?\*/, `*อัปเดตล่าสุดเมื่อ: ${dateFull}*`);
            fs.writeFileSync(dashMdPath, dashMd, 'utf8');

            // 3. Update TRAVEL_MAP.html
            const mapPath = path.join(ROOT_DIR, 'TRAVEL_MAP.html');
            let mapHtml = fs.readFileSync(mapPath, 'utf8');

            // Find coordinates from mapHtml
            let lat = 16.0, lng = 100.0;
            const parkCoordRegex = new RegExp(`\\{\\s*name:\\s*"${name}",\\s*lat:\\s*([\\d\\.]+),\\s*lng:\\s*([\\d\\.]+),\\s*prov:\\s*"${prov}"\\s*\\},?`);
            const coordMatch = mapHtml.match(parkCoordRegex);
            if (coordMatch) {
                lat = parseFloat(coordMatch[1]);
                lng = parseFloat(coordMatch[2]);
                // Remove from unvisited
                mapHtml = mapHtml.replace(parkCoordRegex, '');
            }

            // Add to visitedParks
            const newVisitedParkEntry = `        { name: "${name}", lat: ${lat}, lng: ${lng}, prov: "${prov}" }\n    ];`;
            mapHtml = mapHtml.replace(/(\{\s*name:[^}]+\}\s*)\n\s*\];\s*\n\s*const unvisitedParks/, `$1,\n${newVisitedParkEntry}\n\n    const unvisitedParks`);

            // Check visitedProvinces
            const engProv = thaiToEngProvince[prov] || prov;
            if (!mapHtml.includes(`"${engProv}"`)) {
                mapHtml = mapHtml.replace(/(const visitedProvinces = \[[^\]]*)"([^"]+)"(\s*\];)/s, `$1"$2", "${engProv}"$3`);
            }

            // Update stats
            mapHtml = mapHtml.replace(/<b>อุทยานที่ไปแล้ว:<\/b> \d+ แห่ง/, `<b>อุทยานที่ไปแล้ว:</b> ${newCount} แห่ง`);
            mapHtml = mapHtml.replace(/<b>จังหวัดที่ไปแล้ว:<\/b> \d+ จังหวัด/, `<b>จังหวัดที่ไปแล้ว:</b> ${provCount} จังหวัด`);
            fs.writeFileSync(mapPath, mapHtml, 'utf8');

            // 4. Update TRAVEL_DASHBOARD.html
            const dashHtmlPath = path.join(ROOT_DIR, 'TRAVEL_DASHBOARD.html');
            let dashHtml = fs.readFileSync(dashHtmlPath, 'utf8');

            // Update stats grid
            dashHtml = dashHtml.replace(/<p id="overall-success-count">\d+ \/ 156<\/p>/, `<p id="overall-success-count">${newCount} / 156</p>`);
            dashHtml = dashHtml.replace(/<small id="overall-success-percent">[\d\.]+%<\/small>/, `<small id="overall-success-percent">${newPercent}%</small>`);
            dashHtml = dashHtml.replace(/<p id="visited-provinces-count">\d+<\/p>/, `<p id="visited-provinces-count">${provCount}</p>`);
            dashHtml = dashHtml.replace(/<p style="font-size: 1.2em;" id="latest-trip-date">.*?<\/p>/, `<p style="font-size: 1.2em;" id="latest-trip-date">${dateShort}</p>`);
            dashHtml = dashHtml.replace(/<small id="latest-trip-parks">.*?<\/small>/, `<small id="latest-trip-parks">${name}</small>`);

            // Update footer
            dashHtml = dashHtml.replace(/อัปเดตล่าสุดเมื่อ: .*? \| ข้อมูลซิงค์อัตโนมัติจาก TRAVEL_DASHBOARD.md/,
                `อัปเดตล่าสุดเมื่อ: ${dateFull} | ข้อมูลซิงค์อัตโนมัติจาก TRAVEL_DASHBOARD.md`);

            // Add to baselineTravelData
            const newBaselineLog = `        { id: ${newCount}, date: "${dateShort}", name: "${name}", prov: "${prov}", act: "${act}" },\n`;
            dashHtml = dashHtml.replace(/(const baselineTravelData = \[\r?\n)/, `$1${newBaselineLog}`);

            fs.writeFileSync(dashHtmlPath, dashHtml, 'utf8');

            // 5. Update unvisited_parks.txt
            const unvisitedTxtPath = path.join(ROOT_DIR, 'unvisited_parks.txt');
            if (fs.existsSync(unvisitedTxtPath)) {
                let unvisitedTxt = fs.readFileSync(unvisitedTxtPath, 'utf8');
                unvisitedTxt = unvisitedTxt.replace(parkCoordRegex, '');
                fs.writeFileSync(unvisitedTxtPath, unvisitedTxt, 'utf8');
            }

            // 6. Optional Git Commit & Push
            if (gitPush) {
                const gitCmd = `git add CHECKLIST.md TRAVEL_DASHBOARD.md TRAVEL_MAP.html TRAVEL_DASHBOARD.html unvisited_parks.txt && git commit -m "Record trip to ${name} on ${dateShort}" && git push origin main`;
                exec(gitCmd, { cwd: ROOT_DIR }, (err, stdout, stderr) => {
                    if (err) {
                        resolve({ success: true, newCount, name, dateShort, gitPushed: false, gitError: stderr || err.message });
                    } else {
                        resolve({ success: true, newCount, name, dateShort, gitPushed: true, gitLog: stdout });
                    }
                });
            } else {
                resolve({ success: true, newCount, name, dateShort, gitPushed: false });
            }
        } catch (err) {
            reject(err);
        }
    });
}

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ status: 'ok', message: 'Local Sync Server is running' }));
        return;
    }

    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body);
                const result = await updateProjectFiles(payload);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, ...result }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // Static file serving
    let filePath = path.join(ROOT_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
            '.html': 'text/html; charset=utf-8',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.md': 'text/markdown; charset=utf-8'
        };
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain; charset=utf-8' });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`🌲 National Park Sync Server running at http://localhost:${PORT}`);
});
