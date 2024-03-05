import styles from "../helpoers/colors.js";


class Logger {

  separator = Array(Math.trunc(process.stdout.columns / 2)).fill('-').join('').replace('/,/g', '');
  
  terminalWidth = process.stdout.columns / 2;

  printSeparator(color) {
    console.log(`\t${color}\x1b[0m`, this.separator);
  }

  printText (color,message) {
    console.log(`\t${color}\x1b[0m]`,message);
  }

  printProgressBar (progress) {
    
    const progressBar = new Array(Math.trunc((this.terminalWidth / 100) * progress)).fill('>').join('');
    console.log('\t' + progressBar);
  }
  printProgerssNum (current,max) {
    console.log(`\tDONE [${current} : ${max}] `);
  }
  clearConsole = console.clear;
}

const logger = new Logger();
export default logger;
