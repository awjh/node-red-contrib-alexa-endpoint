export class OutputHandler {
    public static selectOutputFromArray(selectable: any[], toFind: any, msg: any) {
        const outputs = [];

        selectable.forEach(() => {
            outputs.push(null);
        });

        if (selectable.includes(toFind)) {            
            outputs[selectable.indexOf(toFind)] = msg;
        }

        return outputs;
    }
}