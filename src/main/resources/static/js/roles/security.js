const SecurityDashboard = {
    async init(user) {
        console.log('Initializing Security Dashboard');
        this.user = user;
        document.getElementById('btn-logs').style.display = 'inline-block';

        await this.loadStats();
        // Load Logs by default or All Permits
        await this.loadAllPermits();
    },

    async loadStats() {
        // Implement Security Stats
    },

    async loadAllPermits() {
        const permits = await Permits.getAll();
        // Render 
    }
};
