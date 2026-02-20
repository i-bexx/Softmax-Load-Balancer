// --- YARDIMCI MATEMATİK FONKSİYONLARI ---

function randomNormal(mean, std) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    
    return num * std + mean;
}

// --- SINIFLAR ---

class Server {
    constructor(id, initialMeanLatency) {
        this.id = id;
        this.meanLatency = initialMeanLatency;
    }

    handleRequest() {
        let latency = randomNormal(this.meanLatency, 1.0);

        this.meanLatency += randomNormal(0, 0.5);
        if (this.meanLatency < 1) this.meanLatency = 1;

        return latency;
    }
}

class LoadBalancerAgent {
    constructor(nServers, algorithm = 'softmax', temperature = 1.0) {
        this.nServers = nServers;
        this.algorithm = algorithm;
        this.temperature = temperature;

        this.qValues = new Array(nServers).fill(0);
        this.counts = new Array(nServers).fill(0);

        this.rrIndex = 0;
    }

    selectServer() {
        if (this.algorithm === 'random') {
            return Math.floor(Math.random() * this.nServers);
        } 
        else if (this.algorithm === 'round_robin') {
            const serverId = this.rrIndex;
            this.rrIndex = (this.rrIndex + 1) % this.nServers;
            return serverId;
        } 
        else if (this.algorithm === 'softmax') {
            const preferences = this.qValues.map(q => -q);
            
            const maxVal = Math.max(...preferences);
            const shift = preferences.map(p => p - maxVal);
            
            const exponentials = shift.map(s => Math.exp(s / this.temperature));
            const sumExp = exponentials.reduce((a, b) => a + b, 0);
            const probabilities = exponentials.map(e => e / sumExp);
            
            const rand = Math.random();
            let cumulative = 0;
            for (let i = 0; i < this.nServers; i++) {
                cumulative += probabilities[i];
                if (rand <= cumulative) return i;
            }
            return this.nServers - 1;
        }
    }

    update(serverId, latency) {
        this.counts[serverId]++;
        const n = this.counts[serverId];
        
        const currentQ = this.qValues[serverId];
        this.qValues[serverId] = currentQ + (latency - currentQ) / n;
    }
}

// --- SİMÜLASYON ---

function runSimulation() {
    const nSteps = 1000;
    const nServers = 5;
    const servers = [];
    for(let i=0; i<nServers; i++) {
        servers.push(new Server(i, 10.0));
    }
    const agents = {
        'Softmax': new LoadBalancerAgent(nServers, 'softmax', 5.0),
        'RoundRobin': new LoadBalancerAgent(nServers, 'round_robin'),
        'Random': new LoadBalancerAgent(nServers, 'random')
    };
    const results = {
        'Softmax': [],
        'RoundRobin': [],
        'Random': []
    };
    console.log("Simülasyon başlıyor...");
    for (let step = 0; step < nSteps; step++) {
        for (const [name, agent] of Object.entries(agents)) {
            // 1. Seç
            const serverId = agent.selectServer();
            const latency = servers[serverId].handleRequest();

            agent.update(serverId, latency);

            results[name].push(latency);
        }
    }
    console.log("Simülasyon bitti. Ortalama Sonuçlar:");
    for (const [name, data] of Object.entries(results)) {
        const sum = data.reduce((a, b) => a + b, 0);
        const avg = sum / data.length;
        console.log(`${name}: Ortalama Gecikme = ${avg.toFixed(2)} ms`);
    }
}

runSimulation();