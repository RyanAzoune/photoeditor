/* Auteurs: Tarik Laouisset (20159991), Ryan Azoune (20162578)
  Le code permet au mini-logiciel "Super Éditeur de Photos 3000" de faire des effets
  sur des images, du style des effets de base disponible dans GIMP ou Photoshop.
 */

// Calcule la luminance d'un pixel
function luminance(pixel) {
	var lum = 0.2126 * pixel.r + 0.7152 * pixel.g + 0.0722 * pixel.b;
	return lum;
}

// Calcule la clarté d'un canal de couleur.
function clarte(v, quantite) {
	var clarte = (Math.pow(v/255, quantite))*255;
	return clarte;
}

// Mets l'image en noir et blanc.
function noirEtBlanc(imageOriginale) {
  for(var i = 0; i < imageOriginale.length; i++) { 				// i = lignes
    for(var j = 0; j < imageOriginale[i].length; j++) { 	// j = colonnes
	    var luminosite = luminance(imageOriginale[i][j]);
	    imageOriginale[i][j].r = luminosite;
	    imageOriginale[i][j].g = luminosite;
	    imageOriginale[i][j].b = luminosite;
	  }
  }
  return imageOriginale;
}

// Réduit/Augmente la clarté de l'image
function correctionClarte(imageOriginale, quantite) {
  for(var i = 0; i < imageOriginale.length; i++) {
    for(var j = 0; j < imageOriginale[i].length; j++) { 
	    imageOriginale[i][j].r = clarte(imageOriginale[i][j].r, quantite);
	    imageOriginale[i][j].g = clarte(imageOriginale[i][j].g, quantite);
	    imageOriginale[i][j].b = clarte(imageOriginale[i][j].b, quantite);
	  }
  }
  return imageOriginale;
}

// Ajoute un flou à l'image
function flou(imageOriginale, taille) {
  var N = taille;
  var copie = imageCopy(imageOriginale, N); // Crée une copie du tableau 2D de pixels.
  for(var i = 0; i < imageOriginale.length; i++) {
    for(var j = 0; j < imageOriginale[i].length; j++) {
      imageOriginale[i][j] = moyennePond(copie, N, i, j); // Remplacer pixel par moyenne pondérée du voisinage.
    }
  }
  return imageOriginale;
}

// Calcule la moyenne pondérée du voisinage d'un pixel.
function moyennePond(imageCopie, N, row, col) {
  var centre = Math.floor(N/2);
  // Coins de la matrice du voisinage (NxN)
  var start_col = col - centre;
  var start_row = row - centre;
  var end_row = start_row + N;
  var end_col = start_col + N;

  var final_pixel = {r:0, g:0, b:0};
  for (var r = start_row; r < end_row; r++) {
    for (var c = start_col; c < end_col; c++) {
  // On vérifie si on est en dehors de la matrice 2D de pixels.
      if (r < 0 || c < 0) continue;
      if (r >= imageCopie.length || c >= imageCopie[0].length) continue;
      final_pixel.r += imageCopie[r][c].r;
      final_pixel.g += imageCopie[r][c].g;
      final_pixel.b += imageCopie[r][c].b;
    }
  }
  return final_pixel;
}

// Crée une copie du tableau 2D de pixels.
function imageCopy(imageOriginale, N) {
  if(N == 0) return 0;
  var ratio = 1/(N*N);
  var copie = [];
  for (var i=0; i< imageOriginale.length; i++) {
    copie.push([]);
    for (var j=0; j < imageOriginale[0].length; j++) {
      var pixelCopy = {};
      pixelCopy.r = imageOriginale[i][j].r * ratio;
      pixelCopy.g = imageOriginale[i][j].g * ratio;
      pixelCopy.b = imageOriginale[i][j].b * ratio;
      copie[i].push(pixelCopy);
    }
  }
  return copie;
}

// Détecte les contours de l'image.
function detectionContours(imageOriginale) {
  var copie = imageCopy(imageOriginale, 1);
  for(var i = 0; i < imageOriginale.length; i++) {
    for(var j = 0; j < imageOriginale[i].length; j++) {
      imageOriginale[i][j] = intensiteContour(copie, 3, i, j);
    }
  }
  return imageOriginale;
}

// Calcule l'intensité contour d'un pixel et la mets comme valeur du pixel.
function intensiteContour(imageCopie, N, row, col) {
  var centre = Math.floor(N/2);
  // Trouver les coins de la matrice du voisinage NxN
  var start_col = col - centre;
  var start_row = row - centre;
  var end_row = start_row + N;
  var end_col = start_col + N;

  var pondHoriz = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  var pondVerti = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  var i = -1; // Compteur pour itérer à travers pondHoriz/pondVerti
  var pixelHoriz = {r:0, g:0, b:0};
  var pixelVerti = {r:0, g:0, b:0};
  for (var r = start_row; r < end_row; r++) {
    for (var c = start_col; c < end_col; c++) {
      i += 1; // incrémenter le compteur pour itérer à travers les matrices pondHoriz/pondVerti
      if (r < 0 || c < 0) continue;
      if (r >= imageCopie.length || c >= imageCopie[0].length) continue;
      pixelHoriz.r += imageCopie[r][c].r * pondHoriz[i];
      pixelVerti.r += imageCopie[r][c].r * pondVerti[i];
      }
  }

  var final_pixel = {r:0, g:0, b:0};
  final_pixel.r = Math.max(Math.abs(pixelHoriz.r), Math.abs(pixelVerti.r));
    if(final_pixel.r > 255) final_pixel.r = 255;
    final_pixel.g = final_pixel.r;
    final_pixel.b = final_pixel.r;
    return final_pixel;
}

// Teste les fonctions
function tests() {
  // Cas général
  var imageTest1 = [[{r: 1, g: 2, b: 3}, {r: 4, g: 5, b: 6}, {r: 7, g: 8, b: 9}],
  [{r: 10, g: 11, b: 12}, {r: 13, g: 14, b: 15}, {r: 16, g: 17, b: 18}],
  [{r: 19, g: 20, b: 21}, {r: 22, g: 23, b: 24}, {r: 25, g: 26, b: 27}]];

  assert(noirEtBlanc(imageTest1));
  assert(correctionClarte(imageTest1, 2));
  assert(flou(imageTest1, 10));
  assert(detectionContours(imageTest1));
  assert(luminance({r: 1, g: 2, b: 3}));
  assert(clarte(10, 10));
  assert(moyennePond(imageTest1, 2, 1, 4));
  assert(imageCopy(imageTest1, 5));
  assert(detectionContours(imageTest1));
  assert(intensiteContour(imageTest1, 5, 8, 10));

  // Valeurs négatives
  var imageTest2 = [[{r: -1, g: -2, b: -3}, {r: -4, g: -5, b: -6}, {r: -7, g: -8, b: -9}]];

  assert(noirEtBlanc(imageTest2));
  assert(correctionClarte(imageTest2, -2));
  assert(flou(imageTest2, -10));
  assert(detectionContours(imageTest2));
  assert(luminance({r: -1, g: -2, b: -3}));
  assert(clarte(-10, -10));
  assert(moyennePond(imageTest2, -2, -1, -4));
  assert(imageCopy(imageTest2, -5));
  assert(detectionContours(imageTest2));
  assert(intensiteContour(imageTest2, -5, -8, -10));

  // Valeurs > 255
  var imageTest3 = [[{r: 300, g: 301, b: 302}, {r: 303, g: 304, b: 305}, {r: 306, g: 307, b: 308}]];

  assert(noirEtBlanc(imageTest3));
  assert(correctionClarte(imageTest3, 300));
  assert(flou(imageTest3, 300));
  assert(detectionContours(imageTest3));
  assert(luminance({r: 300, g: 301, b: 302}));
  assert(clarte(300, 300));
  assert(moyennePond(imageTest3, 300, 300, 300));
  assert(imageCopy(imageTest3, 300));
  assert(detectionContours(imageTest3));
  assert(intensiteContour(imageTest3, 300, 300, 300));

  // Valeurs = 0
  var imageTest4 = [[{r: 0, g: 0, b: 0}]];

  assert(noirEtBlanc(imageTest4));
  assert(correctionClarte(imageTest4, 0));
  assert(flou(imageTest4, 0));
  assert(detectionContours(imageTest4));
  assert(luminance({r: 0, g: 0, b: 0}) == 0);
  assert(clarte(0, 0));
  assert(moyennePond(imageTest4, 0, 0, 0));
  assert(imageCopy(imageTest4, 0) == 0);
  assert(detectionContours(imageTest4));
  assert(intensiteContour(imageTest4, 0, 0, 0));

  // Valeurs = strings
  var imageTest5 = [[{r: "a", g: "b", b: "c"}, {r: "d", g: "e", b: "f"}, {r: "g", g: "h", b: "i"}]];

  assert(noirEtBlanc(imageTest5));
  assert(correctionClarte(imageTest5, "a"));
  assert(flou(imageTest5, "b"));
  assert(detectionContours(imageTest5));
  assert(!luminance({r: "c", g: "d", b: "e"}));
  assert(!clarte("a", "b"));
  assert(moyennePond(imageTest5, "a", "b", "c"));
  assert(!imageCopy(imageTest4, "a") == 0);
  assert(detectionContours(imageTest5));
  assert(intensiteContour(imageTest5, "d", "e", "z"));
}