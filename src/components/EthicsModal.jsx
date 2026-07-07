import React from 'react';

export default function EthicsModal({ onAccept }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1B3A4B]/80 backdrop-blur-md"></div>
      <div className="relative bg-white w-full max-w-xl card-shadow overflow-hidden fade-in">
        <div className="bg-[#1B3A4B] p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-[#C8A84B] rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🛡️</span>
          </div>
          <h2 className="text-2xl font-heading text-[#C8A84B]">CivicAI Ethics & Privacy</h2>
          <p className="text-white/70 text-sm mt-2">Our commitment to fair and transparent governance.</p>
        </div>
        
        <div className="p-8 flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="text-2xl mt-1">⚖️</div>
            <div>
              <h3 className="font-bold text-[#1B3A4B]">Non-Partisan Neutrality</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                CivicAI is programmed to be strictly neutral. AI-generated insights do not represent 
                any political party or personal opinion. All data is processed using objective criteria.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="text-2xl mt-1">🔍</div>
            <div>
              <h3 className="font-bold text-[#1B3A4B]">Bias Transparency</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We provide a Bias Transparency Score for all policy explanations. Our models are 
                regularly audited for algorithmic fairness and inclusivity.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="text-2xl mt-1">🔐</div>
            <div>
              <h3 className="font-bold text-[#1B3A4B]">Data Sovereignty</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your discussions and mediations are private. We do not sell your data to third parties. 
                Inputs are used only to refine the local assistant's helpfulness.
              </p>
            </div>
          </div>
          
          <button 
            onClick={onAccept}
            className="w-full mt-4 py-4 bg-[#1B3A4B] text-white font-bold rounded hover:bg-[#122834] transition-all flex items-center justify-center gap-2"
          >
            I UNDERSTAND & AGREE →
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 text-center text-[10px] text-gray-400 uppercase tracking-widest border-t border-gray-100">
          Last Updated: April 2024 | Version 2.1.0
        </div>
      </div>
    </div>
  );
}
