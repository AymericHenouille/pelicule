# Pelicule

This project is a simple photo sorter. It takes a directory of photos and sorts them into subdirectories based on the date the photo was taken. It uses the EXIF data from the photo to determine the date.

## Installation

This project requires node.js and npm to be installed. To install the project, run the following commands:

```bash
npm install -g photo-sorter
```

## Usage

To use the photo sorter, run the following command:

```bash
photo-sorter <source> <destination>
```

Where `<source>` is the directory containing the photos to be sorted and `<destination>` is the directory where the sorted photos should be placed.

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more details.


## Objectives

Interpreter les fichier xmp
Enregistrer les dates pour la totalité d'un dossier
Fusionner les donné caches
appliquer le trie recursif