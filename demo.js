// =====================================================================
// JOVI SYSTEM · Prestamos Pro — Modo Demo
// Si la URL trae ?demo=1, esto reemplaza el cliente real de Supabase por
// uno falso en memoria, sembrado con datos de ejemplo. app.js no se entera
// de la diferencia: hace exactamente las mismas llamadas, pero nunca toca
// tu base de datos real. Nada de lo que se haga aqui se guarda al recargar.
// =====================================================================

(function () {
  const params = new URLSearchParams(location.search);
  if (params.get("demo") !== "1") return;

  const uid = (n) => `demo-${n}`;
  const nowIso = () => new Date().toISOString();
  const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
  const daysFromNow = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

  const DEMO_USER_ID = uid("user-admin");
  const DEMO_COMPANY_ID = uid("company");

  const store = {
    companies: [{
      id: DEMO_COMPANY_ID, name: "Empresa Demo", currency: "$", late_fee_type: "fixed", late_fee_value: 100,
      logo_url: null, theme_color: "#22d3ee", created_at: daysAgo(120)
    }],
    profiles: [
      { id: DEMO_USER_ID, username: "Admin Demo", role: "admin", company_id: DEMO_COMPANY_ID, created_at: daysAgo(120) },
      { id: uid("user-collector"), username: "Cobrador Demo", role: "collector", company_id: DEMO_COMPANY_ID, created_at: daysAgo(90) }
    ],
    clients: [
      { id: uid("client-1"), company_id: DEMO_COMPANY_ID, name: "Maria Perez", document: "001-1234567-8", phone: "8095551234", address: "Santo Domingo Este", created_at: daysAgo(100) },
      { id: uid("client-2"), company_id: DEMO_COMPANY_ID, name: "Juan Ramirez", document: "001-9876543-2", phone: "8295559876", address: "Santiago", created_at: daysAgo(80) },
      { id: uid("client-3"), company_id: DEMO_COMPANY_ID, name: "Carla Sosa", document: "001-4567891-0", phone: "8495554567", address: "La Vega", created_at: daysAgo(60) },
      { id: uid("client-4"), company_id: DEMO_COMPANY_ID, name: "Pedro Martinez", document: "001-3216549-7", phone: "8095557890", address: "San Cristobal", created_at: daysAgo(40) }
    ],
    loans: [
      { id: uid("loan-1"), company_id: DEMO_COMPANY_ID, client_id: uid("client-1"), code: "PRE-0001", principal: 20000, rate: 10, frequency: "monthly", terms: 6, start_date: daysAgo(90), interest_type: "flat", note: "Prestamo al dia", created_by: DEMO_USER_ID, status_override: null, installment_overrides: {}, refinanced_from: null, created_at: daysAgo(90) },
      { id: uid("loan-2"), company_id: DEMO_COMPANY_ID, client_id: uid("client-2"), code: "PRE-0002", principal: 15000, rate: 12, frequency: "biweekly", terms: 8, start_date: daysAgo(75), interest_type: "simple", note: "Cliente atrasado", created_by: DEMO_USER_ID, status_override: null, installment_overrides: {}, refinanced_from: null, created_at: daysAgo(75) },
      { id: uid("loan-3"), company_id: DEMO_COMPANY_ID, client_id: uid("client-3"), code: "PRE-0003", principal: 8000, rate: 8, frequency: "weekly", terms: 10, start_date: daysAgo(65), interest_type: "flat", note: "", created_by: DEMO_USER_ID, status_override: null, installment_overrides: {}, refinanced_from: null, created_at: daysAgo(65) },
      { id: uid("loan-4"), company_id: DEMO_COMPANY_ID, client_id: uid("client-4"), code: "PRE-0004", principal: 30000, rate: 10, frequency: "monthly", terms: 3, start_date: daysAgo(85), interest_type: "flat", note: "Prestamo saldado", created_by: DEMO_USER_ID, status_override: null, installment_overrides: {}, refinanced_from: null, created_at: daysAgo(85) }
    ],
    payments: [
      { id: uid("pay-1"), company_id: DEMO_COMPANY_ID, loan_id: uid("loan-1"), date: daysAgo(60), amount: 3667, created_by: DEMO_USER_ID, created_at: daysAgo(60) },
      { id: uid("pay-2"), company_id: DEMO_COMPANY_ID, loan_id: uid("loan-1"), date: daysAgo(30), amount: 3667, created_by: DEMO_USER_ID, created_at: daysAgo(30) },
      { id: uid("pay-3"), company_id: DEMO_COMPANY_ID, loan_id: uid("loan-2"), date: daysAgo(55), amount: 2100, created_by: DEMO_USER_ID, created_at: daysAgo(55) },
      { id: uid("pay-4"), company_id: DEMO_COMPANY_ID, loan_id: uid("loan-3"), date: daysAgo(50), amount: 880, created_by: DEMO_USER_ID, created_at: daysAgo(50) },
      { id: uid("pay-5"), company_id: DEMO_COMPANY_ID, loan_id: uid("loan-3"), date: daysAgo(40), amount: 880, created_by: DEMO_USER_ID, created_at: daysAgo(40) },
      { id: uid("pay-6"), company_id: DEMO_COMPANY_ID, loan_id: uid("loan-3"), date: daysAgo(1), amount: 880, created_by: DEMO_USER_ID, created_at: daysAgo(1) },
      { id: uid("pay-7"), company_id: DEMO_COMPANY_ID, loan_id: uid("loan-4"), date: daysAgo(50), amount: 11000, created_by: DEMO_USER_ID, created_at: daysAgo(50) },
      { id: uid("pay-8"), company_id: DEMO_COMPANY_ID, loan_id: uid("loan-4"), date: daysAgo(20), amount: 11000, created_by: DEMO_USER_ID, created_at: daysAgo(20) },
      { id: uid("pay-9"), company_id: DEMO_COMPANY_ID, loan_id: uid("loan-4"), date: today_(), amount: 11000, created_by: DEMO_USER_ID, created_at: nowIso() }
    ],
    audit_log: []
  };

  function today_() { return new Date().toISOString().slice(0, 10); }

  function matches(row, filters) {
    return Object.entries(filters).every(([key, value]) => String(row[key]) === String(value));
  }

  class MockQuery {
    constructor(table) {
      this.table = table;
      this.filters = {};
      this.mode = "select";
      this.payload = null;
      this.singleFlag = false;
      this.orderCol = null;
      this.orderAsc = true;
    }
    select() { return this; }
    eq(col, val) { this.filters[col] = val; return this; }
    order(col, opts) { this.orderCol = col; this.orderAsc = !opts || opts.ascending !== false; return this; }
    limit(n) { this.limitN = n; return this; }
    single() { this.singleFlag = true; return this; }
    insert(payload) { this.mode = "insert"; this.payload = payload; return this; }
    update(payload) { this.mode = "update"; this.payload = payload; return this; }
    delete() { this.mode = "delete"; return this; }

    _run() {
      const rows = store[this.table] || (store[this.table] = []);

      if (this.mode === "insert") {
        const items = Array.isArray(this.payload) ? this.payload : [this.payload];
        const inserted = items.map(item => ({ id: uid(Math.random().toString(36).slice(2)), created_at: nowIso(), ...item }));
        rows.push(...inserted);
        return { data: this.singleFlag ? inserted[0] : inserted, error: null };
      }

      if (this.mode === "update") {
        const affected = rows.filter(row => matches(row, this.filters));
        affected.forEach(row => Object.assign(row, this.payload));
        return { data: this.singleFlag ? affected[0] : affected, error: null };
      }

      if (this.mode === "delete") {
        const remaining = rows.filter(row => !matches(row, this.filters));
        store[this.table] = remaining;
        return { data: null, error: null };
      }

      // select
      let result = rows.filter(row => matches(row, this.filters));
      if (this.orderCol) {
        result = [...result].sort((a, b) => {
          const av = a[this.orderCol], bv = b[this.orderCol];
          return this.orderAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
        });
      }
      if (this.limitN) result = result.slice(0, this.limitN);
      if (this.singleFlag) return { data: result[0] || null, error: result[0] ? null : { message: "No encontrado" } };
      return { data: result, error: null };
    }

    then(resolve, reject) {
      try { resolve(this._run()); } catch (err) { reject ? reject(err) : Promise.reject(err); }
    }
  }

  const mockStorage = {
    from() {
      return {
        upload: async () => ({ data: { path: "demo" }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "logo.png" } })
      };
    }
  };

  const mockAuth = {
    async getSession() {
      return { data: { session: { user: { id: DEMO_USER_ID, email: "demo@jovisystem.com" }, access_token: "demo-token" } } };
    },
    async signOut() {
      location.href = "index.html";
      return { error: null };
    },
    async signInWithPassword() {
      return { data: { session: { user: { id: DEMO_USER_ID, email: "demo@jovisystem.com" } } }, error: null };
    },
    async resetPasswordForEmail() {
      return { error: { message: "No disponible en modo demo." } };
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe() {} } } };
    }
  };

  window.supabase = {
    createClient() {
      return {
        auth: mockAuth,
        storage: mockStorage,
        from(table) { return new MockQuery(table); }
      };
    }
  };

  window.addEventListener("DOMContentLoaded", () => {
    const banner = document.createElement("div");
    banner.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:90;background:#f5a524;color:#111;text-align:center;font-weight:800;font-size:12.5px;padding:7px 10px;";
    banner.textContent = "MODO DEMO — datos de ejemplo, nada se guarda de verdad";
    document.body.prepend(banner);
  });
})();
