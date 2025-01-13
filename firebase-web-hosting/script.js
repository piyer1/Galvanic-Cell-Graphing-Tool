document.getElementById("plot-button").addEventListener("click", () => {
    const anodeMetal = document.getElementById("anode-metal").value;
    const cathodeMetal = document.getElementById("cathode-metal").value;
    const A0 = parseFloat(document.getElementById("A0-input").value);
    const C0 = parseFloat(document.getElementById("C0-input").value);
    const k = parseFloat(document.getElementById("k-input").value);
    const n = parseFloat(document.getElementById("n-input").value);

    try {
        const reductionPotentials = [
            {
                metalIon: "Au³⁺",
                potential: 1.50,
                electrons: 3
            },
            {
                metalIon: "Ag⁺",
                potential: 0.80,
                electrons: 1
            },
            {
                metalIon: "Cu⁺",
                potential: 0.52,
                electrons: 1
            },
            {
                metalIon: "Cu²⁺",
                potential: 0.34,
                electrons: 2
            },
            {
                metalIon: "Pb²⁺",
                potential: -0.13,
                electrons: 2
            },
            {
                metalIon: "Sn²⁺",
                potential: -0.14,
                electrons: 2
            },
            {
                metalIon: "Ni²⁺",
                potential: -0.26,
                electrons: 2
            },
            {
                metalIon: "Fe²⁺",
                potential: -0.45,
                electrons: 2
            },
            {
                metalIon: "Cr³⁺",
                potential: -0.74,
                electrons: 3
            },
            {
                metalIon: "Zn²⁺",
                potential: -0.76,
                electrons: 2
            },
            {
                metalIon: "Mn²⁺",
                potential: -1.19,
                electrons: 2
            },
            {
                metalIon: "Al³⁺",
                potential: -1.66,
                electrons: 3
            },
            {
                metalIon: "Mg²⁺",
                potential: -2.37,
                electrons: 2
            },
            {
                metalIon: "Na⁺",
                potential: -2.71,
                electrons: 1
            },
            {
                metalIon: "Ca²⁺",
                potential: -2.87,
                electrons: 2
            },
            {
                metalIon: "Ba²⁺",
                potential: -2.91,
                electrons: 2
            },
            {
                metalIon: "K⁺",
                potential: -2.93,
                electrons: 1
            },
            {
                metalIon: "Li⁺",
                potential: -3.04,
                electrons: 1
            }
        ];

        const anode = reductionPotentials.find(metal => metal.metalIon === anodeMetal);
        const cathode = reductionPotentials.find(metal => metal.metalIon === cathodeMetal);

        if (!anode || !cathode) throw new Error("Invalid metal selection.");


        const E = cathode.potential - anode.potential;
        if (E < 0){
            throw new Error("This cell is not a galvanic cell, as the overall reaction is not spontaneous. It is an electrolytic cell and would need current to power it.")
        }
        const a = anode.electrons;
        const c = cathode.electrons;

        if ([A0, C0, k, n].some(isNaN)) {
            throw new Error("All parameters (A₀, C₀, k, n) must be provided and valid numbers.");
        }

        function gcd(a, b) { 
            for (let temp = b; b !== 0;) { 
                b = a % b; 
                a = temp; 
                temp = b; 
            } 
            return a; 
        } 
          
        function lcmFunction(a, b) { 
            const gcdValue = gcd(a, b); 
            return (a * b) / gcdValue; 
        }

        // Define the equation as a function of t
        const equation = (t) => {
            const x = lcmFunction (a, c);
            if (n != 1){
                const var1 = 1-n;
                const var2 = Math.pow(C0, var1);
                const var3 = var2 - (k*t*var1);
                const var4 = Math.pow(var3, 1 / var1);
                const var5 = C0 - var4;
                const var6 = c * var5 / a;
                const var7 = Math.pow(A0 + var6, x/a);
                const var8 = Math.pow(var4, x/c);
                const var9 = var7 / var8;
                const var10 = Math.log(var9);
                return E - (0.0592 * var10);
            }
            else{
                const var1 = C0 * (Math.exp(-1*k*t));
                const var2 = c * (C0 - var1)/a;
                const var3 = A0 + var2;
                const var4 = Math.pow(var3, x/a);
                const var5 = Math.pow(var1, x/c);
                const var6 = Math.log(var4/var5);
                return E - (0.0592 * var6);
            }
        };

        // Function to generate data points for a range of t
        const generateData = (minT, maxT, step) => {
            const tValues = [];
            const yValues = [];
            for (let t = minT; t <= maxT; t += step) {
                tValues.push(t);
                yValues.push(equation(t));
            }
            return { t: tValues, y: yValues };
        };

        // Initial range and step size
        let tRange = [0, 100];
        const step = 1;

        // Generate initial data
        const initialData = generateData(tRange[0], tRange[1], step);

        // Plot the initial graph
        const trace = {
            x: initialData.t,
            y: initialData.y,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#007bff' },
        };

        const layout = {
            title: `Graph of Voltage over Time based on Reactant Kinetic Order`,
            xaxis: { title: 'Time (hrs)', range: tRange },
            yaxis: { title: 'Potential (V)' },
        };

        Plotly.newPlot('graph', [trace], layout);

        // Listen for zoom and pan events
        const graphDiv = document.getElementById('graph');
        graphDiv.on('plotly_relayout', (eventData) => {
            const newMinT = eventData['xaxis.range[0]'];
            const newMaxT = eventData['xaxis.range[1]'];

            if (newMinT !== undefined && newMaxT !== undefined) {
                // Convert to integer range for consistency
                const updatedRange = [
                    Math.floor(newMinT),
                    Math.ceil(newMaxT),
                ];

                // Generate new data points for the updated range
                const updatedData = generateData(updatedRange[0], updatedRange[1], step);

                // Update the graph with new data
                Plotly.react('graph', [{
                    x: updatedData.t,
                    y: updatedData.y,
                    type: 'scatter',
                    mode: 'lines',
                    line: { color: '#007bff' },
                }], {
                    ...layout,
                    xaxis: { ...layout.xaxis, range: updatedRange },
                });

                // Update the global range
                tRange = updatedRange;
            }
        });
    } catch (error) {
        alert(error.message || "An error occurred while plotting the graph.");
    }
});
