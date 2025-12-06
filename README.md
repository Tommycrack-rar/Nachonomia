
BIENVENIDO A NACHONOMÍA

Este es un juego de estrategia por turnos 1 vs IA ambientado en el mapa de la Universidad Nacional representado como un grafo de 17 zonas. 
El jugador elige una de tres facciones (ESMAD, Capuchos o Minga), cada una con tropas con estadísticas únicas y una habilidad especial con cooldown. La IA usa una de las facciones restantes.
Cada nodo del mapa muestra su dueño, cantidad de tropas y nombre al pasar el cursor. Los nodos conectados permiten mover, atacar y expandirse. 
Cada turno el jugador puede atacar, defender, producir tropas o usar su habilidad, y obtiene moneda para mejorar acciones (hasta nivel 5) y tropas (hasta nivel 10). 
El objetivo es conquistar todas las zonas o eliminar al oponente, gestionando territorios, recursos y estrategia de manera eficiente.


MAPA
El mapa es un grafo NO DIRIGIDO de 17 nodos:
1. Facultad de artes 
2. Facultad de ciencias 
3. Facultad de ciencias agrarias 
4. Facultad de ciencias económicas 
5. Facultad de ciencias políticas 
6. Facultad de derecho 
7. Facultad de enfermería 
8. Facultad de ingeniería 
9. Facultad de medicina 
10. Facultad de veterinaria 
11. Facultad de odontología 
12. Plaza Che
13. Carpa cultural 
14. El estadio 
15. Posgrados 
16. La 26 
17. La 30

NODOS
El sistema de nodos funciona de la siguiente forma. Tienen posiciones absolutas sobre la imagen del mapa. 
Al empezar una partida cada facción empieza con 1 sola tropa a su disposición, el nodo en el que empiezan será alguno de estos 3 : La 26, La 30 y El estadio. Se eligiran de manera aleatoria, todos los otros nodos serán neutrales y empezaran con 0 tropas.

Un nodo puede ser conquistado cuando el ataque de las tropas de un nodo vecino sea estrictamente mayor a la vida que acumula (el ataque es la suma del ataque de las tropas en este y la vida de un nodo es la suma de la vida de las tropas en este).
En cada turno se sumará 1 tropa a cada nodo que posea la facción, pero se pueden adquirir mejoras para producir más.

FACCIONES
Cada facción cuenta con una única tropa básica las cuales poseen estadísticas de vida, ataque y espacio (la cantidad máxima de tropas que puede haber en cada nodo). 
Estas estadísticas deben variar, pero estar equilibradas, según la facción, por ejemplo: el grupo del ESMAD posee más vida que las demás, pero con un ataque algo bajo y no tanto espacio, mientras que la MINGA puede tener muchas más tropas en un espacio pero no tienen tanta vida, los capuchos son un punto medio. 

Habilidades de facción
Cada facción posee una habilidad única, que se puede utilizar pasada cierta cantidad de turnos. Los del ESMAD pueden realizar un ataque con tanqueta, que aumentará su daño en ese turno, se puede lanzar cada 2 turnos. 
Los Capuchos pueden invocar un escudo de primera línea que reduce el daño del siguiente ataque que reciba un nodo, puede usarse cada 3 turnos. Por último, la MINGA puede duplicar las tropas de un nodo (limitado por su espacio), puede usarse cada 4 turnos.

ACCIONES
Cada turno se pueden realizar ciertas acciones como atacar, defender o producir. La acción atacar es dirigida a cierto nodo, en esta se calcula la diferencia entre el ataque del nodo que ataca y la vida del nodo que es atacado, si el ataque es mayor entonces el nodo atacado es conquistado. 
Con la acción defensa se provee un aumento temporal (3 turnos) de vida en dicho nodo, acumulable con habilidades de facción pero no con otras acciones. Y producir aumenta el número de tropas que recibe un nodo.

Las acciones pueden subirse de nivel, al igual que las estadísticas de tropas, usando una moneda de juego, la cual se consigue a través de los nodos y al conquistar nodos. Entre más alto el nivel de una acción mejor su efecto en el juego . En cuanto a las estadísticas de la tropa, estas aumentaron porcentualmente con cada nivel. 
Las acciones pueden mejorarse 2 veces hasta el nivel 3, las tropas pueden mejorarse hasta 8 niveles por estadistica. LAS HABILIDADES DE FACCIÓN NO MEJORAN.


Mecánicas del juego
En cada turno vas a poder realizar cierta cantidad de acciones, dependiendo de un número fijo que depende de la cantidad de nodos que tengas. Todas las facciones empiezan con 1 nodo y 1 acción. Las acciones van creciendo dependiendo de la cantidad de nodos que poseas hasta que tengas 4. Una vez llegado a 4 nodos, las acciones también llegarán a 4 y se mantendrán ahí aunque consigas más nodos.
Los nodo pertenecientes a cualquier facción deben tener al menos una tropa de esa misma facción, de manera que al atacar cualquier nodo adyacente, van todas las tropas de ese nodo menos uno. Al ganar, las tropas atacantes restan la vida del defensor, y el remanente se mueve al nuevo nodo, dejando 1 en el origen.
Aparte de las acciones, cada facción tiene un medidor de dinero y cada nodo que tengan les genera dinero por turno, adicional de ganar dinero al conquistar otro nodo.

El dinero permite mejorar las acciones y tropas. Las mejoras de acciones van a ser lineales (nivel 1, luego nivel 2 y finalmente nivel 3) hasta 2 por cada una. 
Defensa en nivel 1 da un 10% más de vida al nodo. La primera mejora de defensa va a alargar su efecto por 1 turno más (ahora 2), y la segunda mejora la alarga por otro turno (3). En caso de que el nodo ya tenga la habilidad de defensa activa, no va a poder volverlo a aplicar hasta que se acabe (excepto con la habilidad de los capuchos, que si se puede aplicar a un nodo con defensa activa). Y pierde su estado de defensa activa si es atacado por otro nodo.
Ataque de nivel 1 ataca con el ataque total de las tropas del nodo. La primera mejora de ataque aumenta su ataque total un 10% y la segunda un 20%.
Producir de nivel 1 genera 1 tropa más (2). La primera mejora de producir hace que de una tropa más (ahora produce 3) y la segunda mejora hace que ahora produzca otra más (4).

Cada facción solo va a tener solo 1 tipo de tropa diferente (Especial para cada facción) cada una con 3 atributos: Ataque, Vida y Espacio(cantidad de tropas que caben en un nodo). Si las tropas de un nodo alcanzan el espacio máximo, ese nodo deja de generar tropas y no puede recibir más.
Los capuchos tienen un buen ataque y los demás tributos son normales.
El ESMAD tiene muy buena vida, bajo espacio y un ataque un poco por debajo de lo normal
La Minga tiene vida y ataque más bajo que lo normal pero mucho espacio.
Las mejoras de tropas dan un +5% a cada atributo, y se puede mejorar cada tropa 8 veces.

Durante el turno de cada facción, el jugador (o bot) seleccionará sus movimientos y/o habilidades y al oprimir el botón de pasar turno, se realizarán. Se pueden subir niveles mientras no sea tu turno igualmente pueden.

La dificultad va a ser siempre la misma (mediana). El bot se encargará de revisar los nodos del ajenos, y compararlos con los nodos adyacentes y tendrá prioridad atacar luego defender y luego producir. Primero revisa si comparando un nodo adyacente al nodo del bot, el nodo adyacente tiene menor vida que el nodo del bot, éste lo atacara. Si el nodo no puede atacar, revisará si tiene más ataque que la vida de su nodo, y en caso de que si, defenderá si no tiene defensa activa. Finalmente, si el nodo no tiene ninguna de esas 2 opciones, el bot hará que el nodo produzca.
El bot usará las habilidades siempre que no estén desactivadas por el cooldown y use la acción que las activa (el ESMAD la usará cuando defienda, los capuchos cuando ataquen y la minga cuando produzcan).
El bot también mejorará sus tropas y habilidades, siempre que pueda hacer una mejora la hará.

Reglas de juego
Al iniciar la partida tanto el jugador como la máquina empiezan con un nodo inicial y una única tropa.
Cada facción tiene un número determinado de acciones
Gana quien conquiste todos los nodos o el último en pie
Vibración de la pantalla al usar habilidades especiales. Conquista de Nodo: El hexágono parpadea y cambia de color con un efecto de onda expansiva. UI: Los botones brillan al pasar el cursor. Los paneles se despliegan con una transición suave. Los contadores de recursos se actualizan con un efecto de "pop".
