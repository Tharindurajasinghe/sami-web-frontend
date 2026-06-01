// src/components/ThermalBill.jsx
// OOP-based thermal bill component for 80mm thermal printers.
// Uses a React class component as the main building block, with a
// BillBuilder helper class that constructs the bill data model,
// and a BillPrinter utility class that handles the print logic.
import { Component } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// BillBuilder  — OOP data builder class
// Constructs a normalised bill model from either an Order or a CustomRequest.
// Usage:
//   const bill = new BillBuilder(order, 'order').build();
//   const bill = new BillBuilder(req,   'list').build();
// ─────────────────────────────────────────────────────────────────────────────
class BillBuilder {
  // Shop constants — change here to update on every bill
  static SHOP_NAME    = 'Dissanayaka City Center';
  static SHOP_NAME_SI = 'දිසානායක සිටි සෙන්ටර්';
  static ADDRESS      = 'No 68, Yudaganawa Janapadaya, Buththala';
  static PHONE1       = '+94 70 428 3858';
  static FOOTER_MSG   = 'Thank You! Come Again!';
  static FOOTER_SI    = 'ස්තූතියි! නැවත එන්න!';

  constructor(data, type) {
    this.data = data;   // raw order or customRequest object
    this.type = type;   // 'order' | 'list'
  }

  // Build and return a plain bill model object
  build() {
    return {
      shopName:    BillBuilder.SHOP_NAME,
      shopNameSi:  BillBuilder.SHOP_NAME_SI,
      address:     BillBuilder.ADDRESS,
      phone:       BillBuilder.PHONE1,
      footerMsg:   BillBuilder.FOOTER_MSG,
      footerSi:    BillBuilder.FOOTER_SI,
      billNo:      this._shortId(),
      dateTime:    this._formatDateTime(),
      customer:    this._customerName(),
      phone2:      this.data.phone || '',
      address2:    this.data.address || '',
      type:        this.type,
      // Cart order: structured item rows; Custom list: raw text
      items:       this.type === 'order' ? this._buildItems() : [],
      itemList:    this.type === 'list'  ? (this.data.itemList || '') : '',
      total:       this.type === 'order' ? (this.data.total || 0) : null,
    };
  }

  _shortId() {
    // Use human-readable orderId (DCC000001) if present, else fall back to _id
    return (this.data.orderId || this.data._id || '').toUpperCase();
  }

  _formatDateTime() {
    return new Date(this.data.createdAt || Date.now())
      .toLocaleString('en-LK', {
        year:   'numeric', month:  '2-digit', day:    '2-digit',
        hour:   '2-digit', minute: '2-digit', hour12: true,
      });
  }

  _customerName() {
    return this.data.customerName || this.data.userPhone || '';
  }

  _buildItems() {
    return (this.data.items || []).map(item => ({
      name:     item.name   || '',
      qty:      item.qty    || 1,
      price:    item.price  || 0,
      subtotal: (item.price || 0) * (item.qty || 1),
    }));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BillPrinter  — OOP print utility class
// Opens a minimal print window with 80mm thermal CSS and triggers window.print()
// ─────────────────────────────────────────────────────────────────────────────
class BillPrinter {
  constructor(billHtml) {
    this.billHtml = billHtml;
  }

  print() {
    const win = window.open('', '_blank', 'width=320,height=600');
    if (!win) {
      alert('Pop-up blocked! Please allow pop-ups for this site.');
      return;
    }
    win.document.write(this._wrapHtml());
    win.document.close();
    // Small delay so fonts load before printing
    setTimeout(() => {
      win.focus();
      win.print();
      win.close();
    }, 400);
  }

  _wrapHtml() {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Bill</title>
  <style>
    /* ── 80mm thermal paper reset ── */
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 80mm;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      color: #000;
      background: #fff;
      padding: 4mm 3mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .center   { text-align: center; }
    .right    { text-align: right; }
    .bold     { font-weight: 700; }
    .divider  { border: none; border-top: 1px dashed #000; margin: 4px 0; }
    .divider-solid { border: none; border-top: 2px solid #000; margin: 4px 0; }
    .shop-name {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .shop-name-si {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .meta     { font-size: 11px; margin: 1px 0; }
    .meta-bold{ font-size: 11px; font-weight: 700; margin: 1px 0; }
    .bill-title {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin: 6px 0 4px;
    }
    table { width: 100%; border-collapse: collapse; margin: 4px 0; }
    th {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 0;
      border-bottom: 1px solid #000;
    }
    td { font-size: 12px; padding: 3px 0; vertical-align: top; }
    .col-name  { width: 44%; }
    .col-qty   { width: 10%; text-align: center; }
    .col-price { width: 20%; text-align: right; }
    .col-sub   { width: 26%; text-align: right; }
    .item-name { font-weight: 600; }
    .total-row { font-size: 15px; font-weight: 900; }
    .total-label { text-align: left; }
    .total-amount{ text-align: right; }
    .list-text {
      font-size: 12px;
      white-space: pre-wrap;
      line-height: 1.7;
      padding: 4px 0;
    }
    .thank-you {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 2px;
      margin: 6px 0 2px;
    }
    .footer-si { font-size: 12px; font-weight: 700; }
    .small     { font-size: 10px; color: #444; }
  </style>
</head>
<body>
  ${this.billHtml}
</body>
</html>`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ThermalBill  — React class component (OOP)
// Props:
//   data   — order or customRequest object
//   type   — 'order' | 'list'
//   lang   — 'en' | 'si'
//   onClose — callback to close/hide this component
// ─────────────────────────────────────────────────────────────────────────────
export default class ThermalBill extends Component {

  // Build the bill model once from props
  getBill() {
    return new BillBuilder(this.props.data, this.props.type).build();
  }

  // Render one item row as an HTML string (used for print window)
  renderItemRowHtml(item, index) {
    return `
      <tr>
        <td class="col-name"><span class="item-name">${this._esc(item.name)}</span></td>
        <td class="col-qty">${item.qty}</td>
        <td class="col-price">Rs.${item.price.toFixed(2)}</td>
        <td class="col-sub">Rs.${item.subtotal.toFixed(2)}</td>
      </tr>`;
  }

  // Build the full bill as an HTML string for the print window
  buildPrintHtml(bill) {
    const itemRows = bill.type === 'order'
      ? bill.items.map((item, i) => this.renderItemRowHtml(item, i)).join('')
      : '';

    const itemsSection = bill.type === 'order' ? `
      <table>
        <thead>
          <tr>
            <th class="col-name">Item</th>
            <th class="col-qty">Qty</th>
            <th class="col-price">Price</th>
            <th class="col-sub">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <hr class="divider-solid"/>
      <table>
        <tr>
          <td class="total-label bold" style="font-size:14px">TOTAL</td>
          <td class="total-amount" colspan="3">
            <span class="total-row">Rs. ${bill.total.toFixed(2)}</span>
          </td>
        </tr>
      </table>` : `
      <p class="bold meta" style="margin:4px 0 2px">Item List:</p>
      <p class="list-text">${this._esc(bill.itemList)}</p>`;

    const customerSection = (bill.customer || bill.phone2 || bill.address2) ? `
      <hr class="divider"/>
      ${bill.customer ? `<p class="meta"><span class="bold">Customer:</span> ${this._esc(bill.customer)}</p>` : ''}
      ${bill.phone2   ? `<p class="meta"><span class="bold">Phone:</span> ${this._esc(bill.phone2)}</p>` : ''}
      ${bill.address2 ? `<p class="meta"><span class="bold">Address:</span> ${this._esc(bill.address2)}</p>` : ''}` : '';

    return `
      <div class="center">
        <p class="shop-name">${this._esc(bill.shopName)}</p>
        <p class="shop-name-si">${bill.shopNameSi}</p>
        <p class="meta">${this._esc(bill.address)}</p>
        <p class="meta-bold">${this._esc(bill.phone)}</p>
      </div>
      <hr class="divider-solid"/>
      <div class="center">
        <p class="bill-title">${bill.type === 'order' ? 'INVOICE' : 'ORDER SLIP'}</p>
      </div>
      <p class="meta"><span class="bold">Bill No:</span> #${bill.billNo}</p>
      <p class="meta"><span class="bold">Date:</span> ${bill.dateTime}</p>
      ${customerSection}
      <hr class="divider"/>
      ${itemsSection}
      <hr class="divider"/>
      <div class="center" style="margin-top:8px">
        <p class="thank-you">${this._esc(bill.footerMsg)}</p>
        <p class="footer-si">${bill.footerSi}</p>
        <p class="small" style="margin-top:6px">Powered by TAR Solutions</p>
      </div>`;
  }

  // Trigger the print window
  handlePrint = () => {
    const bill      = this.getBill();
    const printHtml = this.buildPrintHtml(bill);
    new BillPrinter(printHtml).print();
  };

  // Escape HTML special chars to prevent XSS in print window
  _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Visual bill preview rendered inside the admin panel ──────────────────
  render() {
    const { onClose, lang } = this.props;
    const bill = this.getBill();

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ width: 340, maxHeight: '90vh' }}>

          {/* Modal header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <span className="font-bold text-gray-800">
              {lang === 'si' ? 'බිල් පෙරදර්ශනය' : 'Bill Preview'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={this.handlePrint}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
              >
                🖨️ {lang === 'si' ? 'මුද්‍රණය' : 'Print'}
              </button>
              <button onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1">✕</button>
            </div>
          </div>

          {/* Scrollable bill preview */}
          <div className="overflow-y-auto flex-1 p-4">
            <div style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 12,
              width: '100%',
              background: '#fff',
              padding: '8px 6px',
              border: '1px dashed #ccc',
              borderRadius: 8,
              lineHeight: 1.6,
            }}>

              {/* Shop header */}
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {bill.shopName}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{bill.shopNameSi}</div>
                <div style={{ fontSize: 11 }}>{bill.address}</div>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{bill.phone}</div>
              </div>

              <Dashes/>

              {/* Bill title */}
              <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 900, letterSpacing: 3, margin: '4px 0' }}>
                {bill.type === 'order' ? 'INVOICE' : 'ORDER SLIP'}
              </div>

              {/* Meta */}
              <Row label="Bill No" value={`#${bill.billNo}`}/>
              <Row label="Date"    value={bill.dateTime}/>
              {bill.customer && <Row label="Customer" value={bill.customer}/>}
              {bill.phone2   && <Row label="Phone"    value={bill.phone2}/>}
              {bill.address2 && <Row label="Address"  value={bill.address2}/>}

              <Dashes/>

              {/* Items */}
              {bill.type === 'order' ? (
                <>
                  {/* Column headers */}
                  <div style={{ display: 'flex', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: 2, marginBottom: 3 }}>
                    <span style={{ flex: 4 }}>Item</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>Qty</span>
                    <span style={{ flex: 2, textAlign: 'right' }}>Price</span>
                    <span style={{ flex: 2, textAlign: 'right' }}>Total</span>
                  </div>
                  {bill.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', fontSize: 12, padding: '2px 0', borderBottom: '1px dotted #ddd' }}>
                      <span style={{ flex: 4, fontWeight: 600, paddingRight: 2, wordBreak: 'break-word' }}>{item.name}</span>
                      <span style={{ flex: 1, textAlign: 'center' }}>{item.qty}</span>
                      <span style={{ flex: 2, textAlign: 'right' }}>Rs.{item.price.toFixed(2)}</span>
                      <span style={{ flex: 2, textAlign: 'right' }}>Rs.{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '2px solid #000', marginTop: 4, paddingTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 15 }}>
                    <span>TOTAL</span>
                    <span>Rs. {bill.total.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 3 }}>Item List:</div>
                  <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7 }}>
                    {bill.itemList}
                  </pre>
                </>
              )}

              <Dashes/>

              {/* Footer */}
              <div style={{ textAlign: 'center', marginTop: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>{bill.footerMsg}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{bill.footerSi}</div>
                <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>Powered by TAR Solutions</div>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }
}

// ── Small presentational helpers ─────────────────────────────────────────────

function Dashes() {
  return (
    <div style={{ borderTop: '1px dashed #999', margin: '5px 0' }}/>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', fontSize: 11, gap: 4 }}>
      <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{label}:</span>
      <span style={{ wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}