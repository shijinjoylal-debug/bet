#include <iostream>
#include <thread>
#include <chrono>

class Horse {
public:
    float top_speed;
    float strength;

    void running(float speed);
};

void Horse::running(float speed) {
    char distance_covered[] = {'*','*','*','*','*','*','*','*','*','*','*','*','*'};
    std::cout << "====================================================\n";
    std::cout << "====================================================\n";

    // Animation delay based on horse speed (higher speed = faster animation)
    int delay_ms = (speed > 0) ? static_cast<int>(10000.0f / speed) : 200;

    for (size_t i = 0; i < sizeof(distance_covered) / sizeof(distance_covered[0]); i++) {
        std::cout << distance_covered[i] << std::flush;
        std::this_thread::sleep_for(std::chrono::milliseconds(delay_ms));
    }
    std::cout << "\n====================================================\n";
}

int main() {
    Horse margeret;
    margeret.top_speed = 200;
    margeret.strength = 7.5;

    std::cout << "Horse Top Speed: " << margeret.top_speed << "\n";
    std::cout << "Horse Strength: " << margeret.strength << "\n\n";

    margeret.running(145);

    return 0;
}
