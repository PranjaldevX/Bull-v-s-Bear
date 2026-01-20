export interface FinancialTerm {
    term: string;
    definition: string;
    category: 'General' | 'Trading' | 'Economics' | 'Crypto';
}

export const FINANCIAL_TERMS: FinancialTerm[] = [
    {
        term: "Bull Market",
        definition: "A market condition where prices are rising or are expected to rise.",
        category: "General"
    },
    {
        term: "Bear Market",
        definition: "A market condition where prices are falling or are expected to fall.",
        category: "General"
    },
    {
        term: "Volatility",
        definition: "A statistical measure of the dispersion of returns for a given security or market index.",
        category: "Trading"
    },
    {
        term: "Liquidity",
        definition: "The efficiency or ease with which an asset or security can be converted into ready cash without affecting its market price.",
        category: "Trading"
    },
    {
        term: "Diversification",
        definition: "A risk management strategy that mixes a wide variety of investments within a portfolio.",
        category: "Trading"
    },
    {
        term: "Inflation",
        definition: "A general increase in prices and a fall in the purchasing value of money.",
        category: "Economics"
    },
    {
        term: "ROI (Return on Investment)",
        definition: "A performance measure used to evaluate the efficiency or profitability of an investment.",
        category: "General"
    },
    {
        term: "FOMO",
        definition: "Fear Of Missing Out - anxiety that an exciting or interesting event may currently be happening elsewhere, often aroused by posts seen on a social media website.",
        category: "Crypto"
    },
    {
        term: "HODL",
        definition: "A misspelling of 'hold' that refers to a buy-and-hold strategy in the context of bitcoin and other cryptocurrencies.",
        category: "Crypto"
    },
    {
        term: "Market Cap",
        definition: "The total value of all a company's shares of stock.",
        category: "General"
    }
];
