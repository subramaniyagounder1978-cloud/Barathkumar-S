import { useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import {
  REACTION_CATEGORIES,
  type ReactionCategory,
  type ReactionProtocol,
} from '../data/reactions';

interface ReactionLibraryProps {
  protocols: ReactionProtocol[];
  activeProtocolId: string;
  onLoadInBench: (id: string) => void;
}

export function ReactionLibrary({
  protocols,
  activeProtocolId,
  onLoadInBench,
}: ReactionLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All Transformations' | ReactionCategory>(
    'All Transformations'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProtocols = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return protocols.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All Transformations' || p.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const haystack = [
        p.name,
        p.category,
        p.summary,
        p.substrateScope,
        p.product.name,
        p.schemeLabel.conditionsTop,
        p.schemeLabel.conditionsBottom,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [protocols, selectedCategory, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('All Transformations');
    setSearchQuery('');
  };

  return (
    <section id="reaction-library" className="py-16 lg:py-20 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-xs font-mono tracking-wide text-slate-500 mb-2">
              Validated Transformation Catalog
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
              style={{ textWrap: 'balance' }}
            >
              Standard synthetic methodologies &amp; scope
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Filter by reaction class or search by catalyst, ligand, or functional group. Load any
              methodology directly into the Stoichiometry Bench.
            </p>
          </div>

          <div className="w-full lg:w-80 relative">
            <label htmlFor="library-search" className="sr-only">
              Search transformations, catalysts, or substrates
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="library-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Pd, chiral, fluorination..."
              className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div
            role="group"
            aria-label="Filter transformations by category"
            className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/70 rounded-lg"
          >
            {REACTION_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-mono tabular-nums text-slate-500">
            Showing {filteredProtocols.length} of {protocols.length} methodologies
          </p>
        </div>

        {filteredProtocols.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
            <p className="text-sm font-medium text-slate-900">
              No synthetic methodologies match "{searchQuery}"
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Reset filters or submit a custom retrosynthesis request in the inquiry section below.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-md transition-colors cursor-pointer"
            >
              Reset Catalog Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProtocols.map((item) => {
              const isLoaded = item.id === activeProtocolId;
              return (
                <article
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-500">
                      <span>{item.category}</span>
                      <span className="tabular-nums">
                        {item.literatureYieldPct}% yield · {item.typicalTurnaroundDays}d
                      </span>
                    </div>

                    <h3 className="mt-2.5 text-lg font-semibold text-slate-900">{item.name}</h3>

                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.summary}</p>

                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-slate-700">Conditions: </span>
                        <span className="font-mono text-slate-600">
                          {item.schemeLabel.conditionsTop} · {item.schemeLabel.conditionsBottom}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Scope: </span>
                        <span className="text-slate-600">{item.substrateScope}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">QC Release: </span>
                        <span className="text-slate-600">{item.analyticalMethods.join(' · ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-xs font-mono tabular-nums text-slate-500">
                      Default: {item.defaultScaleMmol} mmol
                    </span>

                    <button
                      type="button"
                      onClick={() => onLoadInBench(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isLoaded
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-[#F8FAFC] text-[#1D4ED8] border border-slate-200 hover:bg-blue-50 hover:border-blue-200'
                      }`}
                    >
                      <span>{isLoaded ? 'Active in Bench' : 'Load in Bench'}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
